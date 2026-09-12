import { statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
import { DIST, type Findings, pages } from './files.ts';

/** A ratchet: the largest page, docs/xpui/reference, is 25.9 KB; lower these as pages shrink, never raise them quietly. */
const PAGE_GZIP_LIMIT = 32 * 1024;
const FONT_LIMIT = 80 * 1024;

/** What a reader downloads, measured the way GitHub Pages sends it: gzipped. */
export function withinBudget(): Findings {
  const findings: Findings = [];
  for (const { path, html } of pages()) {
    const size = gzipSync(html, { level: 9 }).length;
    if (size > PAGE_GZIP_LIMIT) findings.push(`${path}: ${(size / 1024).toFixed(1)} KB gzipped, over ${PAGE_GZIP_LIMIT / 1024} KB`);
  }
  const font = statSync(join(DIST, 'fonts', 'GeistMono-Variable.woff2')).size;
  if (font > FONT_LIMIT) findings.push(`the font: ${(font / 1024).toFixed(1)} KB, over ${FONT_LIMIT / 1024} KB`);
  return findings;
}
