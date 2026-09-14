import { readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import type { Emphasis, Image, Root } from 'mdast';
import { visit } from 'unist-util-visit';
import { goldenFigure, pngSize } from '../lib/goldens.ts';
import { imageSource, type LinkContext, rewrite } from '../lib/links.ts';
import { CONTENT_DIR, pageIds, readManifest } from '../lib/manifest.ts';

interface File {
  path?: string;
}

function contextFor(file: File): LinkContext | undefined {
  if (!file.path) return undefined;
  const inside = relative(`${process.cwd()}${sep}${CONTENT_DIR}`, file.path).split(sep).join('/');
  if (inside.startsWith('..')) return undefined;
  const manifest = readManifest();
  const dir = Object.keys(manifest.repos).find((d) => inside.startsWith(`${d}/`));
  if (!dir) return undefined;
  const repo = manifest.repos[dir];
  return {
    dir,
    path: inside.slice(dir.length + 1),
    sha: repo.sha,
    github: repo.github,
    pages: new Set(pageIds(manifest)),
    dirs: new Map(Object.entries(manifest.repos).map(([d, r]) => [r.github, d])),
    synced: new Set(Object.entries(manifest.repos).flatMap(([d, r]) => Object.keys(r.files).map((f) => `${d}/${f}`))),
  };
}

/**
 * A synced golden, sized by its own pixels and wrapped so the stylesheet can give it the page's
 * ink and paper. The wrapper is an `emphasis` renamed to a `span`, a node both mdast and the HTML
 * step accept around an image.
 */
function golden(image: Image, png: string): Emphasis {
  const { kind, width, height } = goldenFigure(pngSize(readFileSync(png)));
  image.data = { ...image.data, hProperties: { width, height } };
  return { type: 'emphasis', data: { hName: 'span', hProperties: { className: ['golden', `golden-${kind}`] } }, children: [image] };
}

/**
 * Every link in a synced file, through `lib/links.ts`. A raw image in a synced repository is
 * served from the site; a relative image has nowhere to resolve to on the site.
 */
export function links() {
  return (tree: Root, file: File) => {
    const ctx = contextFor(file);
    if (!ctx || !file.path) return;
    const page = file.path;
    visit(tree, (node, index, parent) => {
      if (node.type === 'link' || node.type === 'definition') node.url = rewrite(node.url, ctx);
      if (node.type !== 'image') return;
      if (!/^[a-z]+:/i.test(node.url)) {
        throw new Error(`${ctx.dir}/${ctx.path}: relative image "${node.url}" has no home on the site`);
      }
      const src = imageSource(node.url, ctx);
      if (src === node.url) return;
      node.url = src;
      if (parent && index !== undefined && src.endsWith('.png')) parent.children[index] = golden(node, join(dirname(page), src));
    });
  };
}
