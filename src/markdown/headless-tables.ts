import type { Element, Root, Text } from 'hast';
import { visit } from 'unist-util-visit';

function textOf(node: Element): string {
  let text = '';
  visit(node, 'text', (child: Text) => {
    text += child.value;
  });
  return text;
}

/** `| | |` is how these docs write a table with no header; the empty header row is dropped. */
export function headlessTables() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'table') return;
      node.children = node.children.filter(
        (child) => !(child.type === 'element' && child.tagName === 'thead' && textOf(child).trim() === ''),
      );
    });
  };
}
