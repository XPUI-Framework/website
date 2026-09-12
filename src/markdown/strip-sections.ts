import type { Heading, Root } from 'mdast';

const DROPPED = /^licen[cs]e$/i;

function text(node: Heading): string {
  return node.children.map((child) => ('value' in child ? child.value : '')).join('').trim();
}

/**
 * Drops a page's own licence section: the site carries the licence once, in the footer, and every
 * repository carries it in full. Everything else a page says is kept.
 */
export function stripSections() {
  return (tree: Root) => {
    const kept = [];
    let dropping: number | undefined;
    for (const node of tree.children) {
      if (node.type === 'heading') {
        if (dropping !== undefined && node.depth <= dropping) dropping = undefined;
        if (dropping === undefined && DROPPED.test(text(node))) dropping = node.depth;
      }
      if (dropping === undefined) kept.push(node);
    }
    tree.children = kept;
  };
}
