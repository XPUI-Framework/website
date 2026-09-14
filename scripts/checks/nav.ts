import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { syncedIndex, syncedText } from '../../src/lib/content.ts';
import { pageIds, readManifest } from '../../src/lib/manifest.ts';
import { crateLabels, problems } from '../../src/lib/nav.ts';
import { title } from '../../src/lib/sections.ts';
import { type Findings, SITE } from './files.ts';

const readNav = () => JSON.parse(readFileSync(join(SITE, 'nav.json'), 'utf8'));

/** Every synced page has a place in nav.json, and nav.json names nothing that is not synced. */
export function everyPageInTheNav(): Findings {
  const { missing, unlisted, repeated } = problems(readNav(), pageIds(readManifest(SITE)), syncedIndex);
  return [
    ...unlisted.map((id) => `${id}: synced but not in nav.json — give it a place`),
    ...missing.map((id) => `${id}: in nav.json but not synced`),
    ...repeated.map((id) => `${id}: in nav.json twice`),
  ];
}

/** The menu speaks to a reader who does not know the crates: no label is a crate's name. */
export function noCrateLabels(): Findings {
  const titleOf = (id: string) => {
    const [dir, ...rest] = id.split('/');
    return title(syncedText(dir, rest.join('/')));
  };
  return crateLabels(readNav(), titleOf, syncedIndex).map((found) => `${found} — give it a reader's name with a label in nav.json`);
}
