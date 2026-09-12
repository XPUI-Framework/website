import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, type Findings, pages, SITE, walk } from './files.ts';

const SCRIPT = readFileSync(join(SITE, 'src', 'client', 'site.js'), 'utf8');

/** One script per page and it is the site's, word for word; nothing else can run. */
export function oneScript(): Findings {
  const findings: Findings = [];
  for (const { path, html } of pages()) {
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
    if (scripts.length !== 1) findings.push(`${path}: ${scripts.length} scripts`);
    else if (scripts[0][1].trim() || scripts[0][2] !== SCRIPT) findings.push(`${path}: the script is not src/client/site.js`);
    if (/\son[a-z]+\s*=/i.test(html)) findings.push(`${path}: an inline event handler`);
  }
  for (const file of walk(DIST, (p) => /\.m?js$/.test(p))) findings.push(`${file}: a script file in the build`);
  return findings;
}
