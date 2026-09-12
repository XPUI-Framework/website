import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pageIds, readManifest } from '../../src/lib/manifest.ts';
import { problems } from '../../src/lib/nav.ts';
import { type Findings, SITE } from './files.ts';

/** Every synced page has a place in nav.json, and nav.json names nothing that is not synced. */
export function everyPageInTheNav(): Findings {
  const nav = JSON.parse(readFileSync(join(SITE, 'nav.json'), 'utf8'));
  const { missing, unlisted, repeated } = problems(nav, pageIds(readManifest(SITE)));
  return [
    ...unlisted.map((id) => `${id}: synced but not in nav.json — give it a place`),
    ...missing.map((id) => `${id}: in nav.json but not synced`),
    ...repeated.map((id) => `${id}: in nav.json twice`),
  ];
}
