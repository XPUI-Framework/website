import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { DIAGRAMS_DIR, diagramKey, mermaidFences } from '../src/lib/diagrams.ts';
import { matches, selects } from '../src/lib/glob.ts';
import { BOARDS_FILE, blobId, CONTENT_DIR, MANIFEST_FILE, type Manifest, serialise } from '../src/lib/manifest.ts';
import { boardsKey, exportBoards } from './boards.ts';
import { mermaidConfigText, renderDiagrams } from './diagrams.ts';
import { LITTER } from './checks/files.ts';
import * as git from './git.ts';

interface Source {
  dir: string;
  github: string;
  files: string[];
  pages?: boolean;
}

const site = resolve(import.meta.dirname, '..');
const content = join(site, CONTENT_DIR);
const sources = JSON.parse(readFileSync(join(site, 'sources.json'), 'utf8')) as { root: string; repos: Source[] };
const allowUnpushed = process.argv.includes('--unpushed');

function writeIfChanged(path: string, bytes: Buffer): boolean {
  if (existsSync(path) && readFileSync(path).equals(bytes)) return false;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, bytes);
  return true;
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => !LITTER.has(entry.name))
    .flatMap((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory() ? walk(path) : [path];
    });
}

function syncRepo(source: Source, manifest: Manifest, produced: Set<string>): string {
  const dir = resolve(site, sources.root, source.dir);
  if (!git.isCheckout(dir)) throw new Error(`${source.dir}: no checkout at ${dir}`);
  const sha = git.head(dir);
  const pushed = git.isPushed(dir, sha);
  if (!pushed && !allowUnpushed) {
    throw new Error(`${source.dir}: ${sha.slice(0, 7)} is not on origin/main — push it, or preview with --unpushed`);
  }
  const entries = git.tree(dir, sha);
  for (const pattern of source.files) {
    if (!entries.some((entry) => matches(pattern.replace(/^!/, ''), entry.path))) throw new Error(`${source.dir}: "${pattern}" matches nothing`);
  }
  const wanted = entries.filter((entry) => selects(source.files, entry.path));
  let changed = 0;
  const files: Record<string, string> = {};
  for (const entry of wanted) {
    const target = join(content, source.dir, entry.path);
    produced.add(target);
    if (writeIfChanged(target, git.blob(dir, entry.blob))) changed += 1;
    files[entry.path] = entry.blob;
  }
  manifest.repos[source.dir] = { github: source.github, sha, pushed, pages: source.pages ?? true, files };
  const dirty = git.uncommitted(dir, wanted.map((entry) => entry.path));
  const notes = [pushed ? '' : 'NOT PUSHED', dirty.length ? `uncommitted edits left out: ${dirty.join(', ')}` : ''].filter(Boolean);
  return `${source.dir.padEnd(16)} ${sha.slice(0, 7)}  ${wanted.length} files, ${changed} changed${notes.length ? `  (${notes.join('; ')})` : ''}`;
}

/** Every mermaid fence in a page, rendered once per distinct diagram; unchanged diagrams are kept as they are. */
async function syncDiagrams(manifest: Manifest, previous: Manifest | undefined, produced: Set<string>): Promise<string> {
  const cli = JSON.parse(readFileSync(join(site, 'node_modules/@mermaid-js/mermaid-cli/package.json'), 'utf8')).version;
  manifest.mermaid = createHash('sha256').update(`${cli}\n${mermaidConfigText()}`).digest('hex');
  const definitions = new Map<string, string>();
  const from = new Map<string, string[]>();
  for (const [dir, repo] of Object.entries(manifest.repos)) {
    if (!repo.pages) continue;
    for (const path of Object.keys(repo.files).filter((f) => f.endsWith('.md'))) {
      for (const definition of mermaidFences(readFileSync(join(content, dir, path), 'utf8'))) {
        const key = diagramKey(definition);
        definitions.set(key, definition);
        from.set(key, [...(from.get(key) ?? []), `${dir}/${path}`]);
      }
    }
  }
  const file = (key: string) => join(content, DIAGRAMS_DIR, `${key}.svg`);
  const stale = previous?.mermaid !== manifest.mermaid;
  const todo = new Map([...definitions].filter(([key]) => stale || !existsSync(file(key))));
  for (const [key, svg] of await renderDiagrams(todo)) writeIfChanged(file(key), Buffer.from(svg));
  manifest.diagrams = {};
  for (const key of definitions.keys()) {
    produced.add(file(key));
    manifest.diagrams[key] = { blob: blobId(readFileSync(file(key))), from: from.get(key) ?? [] };
  }
  return `${'diagrams'.padEnd(16)} ${definitions.size} distinct, ${todo.size} rendered`;
}

/** The boards' bodies, exported from xpui-boards at its synced commit; exported again only when that changes. */
function syncBoards(manifest: Manifest, previous: Manifest | undefined, produced: Set<string>): string {
  const boards = manifest.repos['xpui-boards'];
  const xpui = manifest.repos.xpui;
  if (!boards || !xpui) return `${'boards'.padEnd(16)} skipped: xpui-boards and xpui are not both sources`;
  const key = boardsKey(boards.sha, xpui.sha);
  const file = join(content, BOARDS_FILE);
  const fresh = previous?.boards?.key !== key || !existsSync(file);
  if (fresh) {
    const root = resolve(site, sources.root);
    writeIfChanged(file, Buffer.from(exportBoards(join(root, 'xpui-boards'), boards.sha, join(root, 'xpui'), xpui.sha)));
  }
  produced.add(file);
  manifest.boards = { key, blob: blobId(readFileSync(file)) };
  return `${'boards'.padEnd(16)} ${JSON.parse(readFileSync(file, 'utf8')).length} described, ${fresh ? 'exported' : 'unchanged'}`;
}

async function main(): Promise<void> {
  const manifestPath = join(content, MANIFEST_FILE);
  const previous: Manifest | undefined = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : undefined;
  const manifest: Manifest = { schema: 1, repos: {}, diagrams: {}, mermaid: '' };
  const produced = new Set([manifestPath]);
  const report = sources.repos.map((source) => syncRepo(source, manifest, produced));
  report.push(syncBoards(manifest, previous, produced));
  report.push(await syncDiagrams(manifest, previous, produced));

  let removed = 0;
  for (const path of walk(content)) {
    if (!produced.has(path)) {
      rmSync(path);
      removed += 1;
    }
  }
  for (const path of walk(content).map(dirname).sort().reverse()) {
    if (existsSync(path) && readdirSync(path).length === 0) rmSync(path, { recursive: true });
  }
  writeIfChanged(manifestPath, Buffer.from(serialise(manifest)));

  console.log(report.join('\n'));
  if (removed) console.log(`removed ${removed} file(s) no source produces any more`);
  console.log(`→ ${relative(process.cwd(), content) || '.'}/`);
}

main().catch((error: Error) => {
  console.error(`sync: ${error.message}`);
  process.exit(1);
});
