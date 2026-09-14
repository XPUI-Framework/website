import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { syncedIndex } from './content.ts';
import { type Nav, type NavPage, flatten, problems } from './nav.ts';
import { title } from './sections.ts';

/** The nav in order, checked against the pages that exist: a nav entry that names no page stops the build. */
export function siteNav(bodies: Map<string, string>): { order: NavPage[] } {
  const nav: Nav = JSON.parse(readFileSync(join(process.cwd(), 'nav.json'), 'utf8'));
  const { missing, repeated } = problems(nav, [...bodies.keys()], syncedIndex);
  if (missing.length) throw new Error(`nav.json names pages that are not synced: ${missing.join(', ')}`);
  if (repeated.length) throw new Error(`nav.json lists a page twice: ${repeated.join(', ')}`);
  return { order: flatten(nav, (id) => title(bodies.get(id) ?? ''), syncedIndex) };
}
