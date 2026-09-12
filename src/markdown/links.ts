import { relative, sep } from 'node:path';
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import { type LinkContext, rewrite } from '../lib/links.ts';
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
  };
}

/** Every link in a synced file, through `lib/links.ts`. A relative image has nowhere to resolve to on the site. */
export function links() {
  return (tree: Root, file: File) => {
    const ctx = contextFor(file);
    if (!ctx) return;
    visit(tree, (node) => {
      if (node.type === 'link' || node.type === 'definition') node.url = rewrite(node.url, ctx);
      if (node.type === 'image' && !/^[a-z]+:/i.test(node.url)) {
        throw new Error(`${ctx.dir}/${ctx.path}: relative image "${node.url}" has no home on the site`);
      }
    });
  };
}
