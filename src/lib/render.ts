import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { MarkdownRenderer } from '@astrojs/markdown-remark';
import { processor, shared } from '../markdown/index.ts';
import { CONTENT_DIR } from './manifest.ts';

let renderer: Promise<MarkdownRenderer> | undefined;

/** Renders markdown through the site's pipeline; naming the synced file it came from lets its links resolve. */
export async function render(markdown: string, from?: { dir: string; path: string }): Promise<string> {
  renderer ??= processor.createRenderer(shared);
  const fileURL = from ? pathToFileURL(join(process.cwd(), CONTENT_DIR, from.dir, from.path)) : undefined;
  const { code } = await (await renderer).render(markdown, { fileURL });
  // Astro resolves an image only in a collection page; a fragment would carry the placeholder.
  if (code.includes('__ASTRO_IMAGE_')) throw new Error('an image in a fragment has no home on the site: only a documentation page serves one');
  return code;
}
