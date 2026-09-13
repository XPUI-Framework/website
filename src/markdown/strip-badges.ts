import type { Paragraph, Root } from 'mdast';

/** A README's first line is its badges; on the site they are GitHub's business, not the page's. */
function isBadgeLine(node: Paragraph): boolean {
  return node.children.every((child) =>
    child.type === 'text' ? child.value.trim() === '' : child.type === 'link' && child.children.every((c) => c.type === 'image'),
  );
}

/** The mark under the badges reads from the repository's own `assets/`; the site draws its own. */
function isLogo(node: Root['children'][number] | undefined): boolean {
  return node?.type === 'html' && node.value.trimStart().startsWith('<picture>');
}

export function stripBadges() {
  return (tree: Root) => {
    const first = tree.children[0];
    if (first?.type === 'paragraph' && isBadgeLine(first)) tree.children.shift();
    if (isLogo(tree.children[0])) tree.children.shift();
  };
}
