import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { selects } from '../src/lib/glob.ts';
import { readManifest } from '../src/lib/manifest.ts';
import * as git from './git.ts';

interface Source {
  dir: string;
  files: string[];
}

const site = resolve(import.meta.dirname, '..');
const sources = JSON.parse(readFileSync(join(site, 'sources.json'), 'utf8')) as { root: string; repos: Source[] };
const manifest = readManifest(site);
let behind = 0;

console.log('What the site shows, against each repository\'s origin/main as of your last fetch:\n');
for (const source of sources.repos) {
  const dir = resolve(site, sources.root, source.dir);
  const shown = manifest.repos[source.dir]?.sha;
  const main = git.isCheckout(dir) ? git.resolve(dir, 'origin/main') : undefined;
  const head = git.isCheckout(dir) ? git.head(dir) : undefined;
  const name = source.dir.padEnd(16);
  if (!shown) {
    console.log(`${name} not synced yet`);
    behind += 1;
    continue;
  }
  if (!manifest.repos[source.dir].pushed || (main && !git.isPushed(dir, shown))) {
    console.log(`${name} ${shown.slice(0, 7)}  synced with --unpushed: push it, then npm run sync`);
    behind += 1;
    continue;
  }
  if (!main) {
    console.log(`${name} ${shown.slice(0, 7)}  (no origin/main to compare with)`);
    continue;
  }
  const count = git.ahead(dir, shown, main);
  if (count === 0) {
    console.log(`${name} ${shown.slice(0, 7)}  up to date`);
    continue;
  }
  behind += 1;
  const pages = git.changedBetween(dir, shown, main).filter((path) => selects(source.files, path));
  const local = head === main ? '' : '  (pull first: your checkout is not at origin/main)';
  console.log(`${name} ${shown.slice(0, 7)} → ${main.slice(0, 7)}  ${count} commit${count === 1 ? '' : 's'} newer, ${pages.length} synced file${pages.length === 1 ? '' : 's'} changed${local}`);
  for (const path of pages) console.log(`${' '.repeat(18)}${path}`);
}

console.log(behind ? '\nTo update: pull those repositories, then npm run sync — see docs/updating.md.' : '\nThe site shows every repository as it is on origin/main.');
