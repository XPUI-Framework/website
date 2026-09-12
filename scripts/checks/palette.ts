import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { type Findings, SITE, walk } from './files.ts';

const ALLOWED = join(SITE, 'src', 'styles', 'tokens.css');
const COLOUR = /#[0-9a-f]{3,8}\b|\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\(|\bopacity\s*:|\b(gr[ae]y|silver|white|black)\b\s*[;})]/gi;

/** Two tones: a colour exists in tokens.css and nowhere else. */
export function twoTones(): Findings {
  const findings: Findings = [];
  for (const file of walk(join(SITE, 'src'), (p) => /\.(css|astro)$/.test(p) && p !== ALLOWED)) {
    const text = readFileSync(file, 'utf8');
    const styles = file.endsWith('.css') ? text : [...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
    for (const match of styles.matchAll(COLOUR)) findings.push(`${relative(SITE, file)}: ${match[0]}`);
  }
  return findings;
}
