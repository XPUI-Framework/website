import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

export const SITE = join(import.meta.dirname, '..', '..');
export const DIST = join(SITE, 'dist');

/** Files a desktop leaves behind; `.gitignore` keeps them out of the repository, so the checks skip them too. */
export const LITTER = new Set(['.DS_Store', 'Thumbs.db']);

export function walk(dir: string, keep: (path: string) => boolean = () => true): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => !LITTER.has(entry.name))
    .flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return entry.name === 'node_modules' || entry.name.startsWith('.astro') ? [] : walk(path, keep);
      return keep(path) ? [path] : [];
    })
    .sort();
}

export function pages(): { path: string; html: string }[] {
  return walk(DIST, (path) => path.endsWith('.html')).map((path) => ({ path: relative(DIST, path), html: readFileSync(path, 'utf8') }));
}

/** A check's verdict: nothing wrong, or one line per problem. */
export type Findings = string[];
