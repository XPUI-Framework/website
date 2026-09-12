import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { BOARDS_FILE, blobId, CONTENT_DIR, MANIFEST_FILE, readManifest } from '../../src/lib/manifest.ts';
import { type Findings, SITE, walk } from './files.ts';

/** Every synced file is byte for byte the blob its manifest names, nothing else is there, and every source is pushed. */
export function syncedContentMatches(): Findings {
  const manifest = readManifest(SITE);
  const content = join(SITE, CONTENT_DIR);
  const findings: Findings = [];
  const expected = new Set([MANIFEST_FILE]);
  for (const [dir, repo] of Object.entries(manifest.repos)) {
    if (!repo.pushed) findings.push(`${dir}: ${repo.sha.slice(0, 7)} is not on origin/main — push it, then npm run sync`);
    for (const [path, id] of Object.entries(repo.files)) {
      const file = join(dir, path);
      expected.add(file);
      try {
        if (blobId(readFileSync(join(content, file))) !== id) findings.push(`${file}: edited by hand — npm run sync restores it`);
      } catch {
        findings.push(`${file}: missing — npm run sync restores it`);
      }
    }
  }
  for (const [key, diagram] of Object.entries(manifest.diagrams ?? {})) {
    const file = join('diagrams', `${key}.svg`);
    expected.add(file);
    try {
      if (blobId(readFileSync(join(content, file))) !== diagram.blob) findings.push(`${file}: edited by hand — npm run sync redraws it`);
    } catch {
      findings.push(`${file}: missing — npm run sync draws it`);
    }
  }
  if (manifest.boards) {
    expected.add(BOARDS_FILE);
    try {
      if (blobId(readFileSync(join(content, BOARDS_FILE))) !== manifest.boards.blob) findings.push(`${BOARDS_FILE}: edited by hand — npm run sync exports it again`);
    } catch {
      findings.push(`${BOARDS_FILE}: missing — npm run sync exports it`);
    }
  }
  for (const path of walk(content).map((p) => relative(content, p))) {
    if (!expected.has(path)) findings.push(`${path}: in content/ but no source produced it`);
  }
  return findings;
}
