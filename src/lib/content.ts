import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONTENT_DIR, readManifest } from './manifest.ts';
import { type IndexEntry, indexEntries } from './reference-index.ts';

const ORG = 'https://github.com/XPUI-Framework';

export function syncedBytes(dir: string, path: string): Buffer {
  return readFileSync(join(process.cwd(), CONTENT_DIR, dir, path));
}

export function syncedText(dir: string, path: string): string {
  return syncedBytes(dir, path).toString('utf8');
}

/** The pages a synced reference index links, as page ids: `xpui/docs/reference/lists.md`. */
export function syncedIndex(id: string): IndexEntry[] {
  const [dir, ...rest] = id.split('/');
  return indexEntries(id, syncedText(dir, rest.join('/')));
}

/**
 * Where a synced file came from: the file at the commit the site shows, and the place to change
 * it. The commit is in the link, never in the page: a reader wants the file, not its hash.
 */
export function sourceOf(dir: string, path: string): { github: string; sha: string; url: string; edit: string } {
  const repo = readManifest().repos[dir];
  if (!repo?.files[path]) throw new Error(`not synced: ${dir}/${path}`);
  return {
    github: repo.github,
    sha: repo.sha,
    url: `${ORG}/${repo.github}/blob/${repo.sha}/${path}`,
    edit: `${ORG}/${repo.github}/edit/main/${path}`,
  };
}
