import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface Site {
  home: Home;
  docs: { title: string; lede: string };
}

export interface Home {
  hero: { headline: string; lede: string; board: string; screen: string; alt: string };
  code: { eyebrow: string; title: string; file: string; within: string; item: string; board: string; golden: string; alt: string };
  paths: { eyebrow: string; title: string; cards: { title: string; pages: string[] }[] };
  repositories: { eyebrow: string; title: string; groups: { title: string; repos: string[] }[] };
}

/** Everything the site decides for itself, in one file; the rest comes from the repositories. */
export function readSite(): Site {
  return JSON.parse(readFileSync(join(process.cwd(), 'site.json'), 'utf8'));
}
