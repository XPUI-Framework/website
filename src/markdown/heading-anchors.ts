import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';

const LINKED = new Set(['h2', 'h3', 'h4']);

function containsLink(node: Element): boolean {
  let found = false;
  visit(node, 'element', (child: Element) => {
    if (child !== node && child.tagName === 'a') found = true;
  });
  return found;
}

/** A section heading links to itself, so a reader can copy where they are. */
export function headingAnchors() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      const id = node.properties?.id;
      if (!LINKED.has(node.tagName) || typeof id !== 'string' || containsLink(node)) return;
      node.children = [{ type: 'element', tagName: 'a', properties: { href: `#${id}`, className: ['anchor'] }, children: node.children }];
    });
  };
}
