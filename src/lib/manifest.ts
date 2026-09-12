import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface SyncedRepo {
  github: string;
  sha: string;
  pushed: boolean;
  /** Whether this repository's markdown becomes documentation pages. */
  pages: boolean;
  files: Record<string, string>;
}

export interface SyncedDiagram {
  blob: string;
  /** The pages whose fences it was rendered from. */
  from: string[];
}

export interface Manifest {
  schema: 1;
  repos: Record<string, SyncedRepo>;
  diagrams: Record<string, SyncedDiagram>;
  /** A hash of the Mermaid configuration and version the diagrams were drawn with. */
  mermaid: string;
}

export const CONTENT_DIR = 'content';
export const MANIFEST_FILE = 'manifest.json';

export function readManifest(root = process.cwd()): Manifest {
  return JSON.parse(readFileSync(join(root, CONTENT_DIR, MANIFEST_FILE), 'utf8'));
}

/** Keys sorted at every level, so the same sources always produce the same bytes. */
export function serialise(manifest: Manifest): string {
  const sorted = (value: unknown): unknown =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => [k, sorted(v)]))
      : value;
  return `${JSON.stringify(sorted(manifest), null, 2)}\n`;
}

/** The id git gives these bytes, so a file can be proved to be the one at a commit. */
export function blobId(bytes: Buffer): string {
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}

/** Every synced markdown file that is a documentation page, as `<dir>/<path>`. */
export function pageIds(manifest: Manifest): string[] {
  return Object.entries(manifest.repos)
    .filter(([, repo]) => repo.pages)
    .flatMap(([dir, repo]) => Object.keys(repo.files).filter((f) => f.endsWith('.md')).map((f) => `${dir}/${f}`))
    .sort();
}
