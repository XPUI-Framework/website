import type { Paragraph, Root } from 'mdast';

/** A README's first line is its badges; on the site they are GitHub's business, not the page's. */
function isBadgeLine(node: Paragraph): boolean {
  return node.children.every((child) =>
    child.type === 'text' ? child.value.trim() === '' : child.type === 'link' && child.children.every((c) => c.type === 'image'),
  );
}

export function stripBadges() {
  return (tree: Root) => {
    const first = tree.children[0];
    if (first?.type === 'paragraph' && isBadgeLine(first)) tree.children.shift();
  };
}
