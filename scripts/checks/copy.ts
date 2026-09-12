import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { WARNING } from '../../src/lib/warning.ts';
import { DIST, type Findings, SITE, walk } from './files.ts';

/** The standard's five: the merged state has no past. The reviewer reads the four warnings case by case. */
const BANNED = /\b(used to|for a while|spec [0-9]+|previously|was found)\b/gi;
const REVIEWED = /\b(this replaces|before this|the first time|no longer)\b/gi;

/** In markdown, a phrase in backticks is quoted rather than said. */
function prose(file: string, text: string): string {
  return file.endsWith('.md') ? text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '') : text;
}

function authored(): string[] {
  const own = (p: string) => /\.(ts|js|astro|css|md|json|sh)$/.test(p) && !p.endsWith('package-lock.json');
  return [
    ...walk(join(SITE, 'src'), own),
    ...walk(join(SITE, 'scripts'), own),
    ...walk(join(SITE, 'docs'), own),
    ...['README.md', 'AGENTS.md', 'sources.json', 'nav.json', 'site.json', 'build-and-test.sh'].map((f) => join(SITE, f)),
    ...walk(join(SITE, 'tools'), (p) => p.endsWith('.rs')),
  ].filter((p) => !p.endsWith(join('checks', 'copy.ts')));
}

export function followsTheStandard(): { findings: Findings; notes: string[] } {
  const findings: Findings = [];
  const notes: string[] = [];
  for (const file of authored()) {
    let text: string;
    try { text = prose(file, readFileSync(file, 'utf8')); } catch { continue; }
    for (const m of text.matchAll(BANNED)) findings.push(`${relative(SITE, file)}: "${m[0]}"`);
    for (const m of text.matchAll(REVIEWED)) notes.push(`${relative(SITE, file)}: "${m[0]}" — read it once`);
  }
  const overview = readFileSync(join(DIST, 'docs', 'xpui', 'index.html'), 'utf8').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  if (!overview.includes(WARNING)) findings.push('docs/xpui/index.html: the warning is not there verbatim');
  return { findings, notes };
}
