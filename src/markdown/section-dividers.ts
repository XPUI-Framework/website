import type { Element, ElementContent, Root, RootContent } from 'hast';
import { divider } from './pixel-rules.ts';

const isDivider = (node: RootContent | undefined): boolean =>
  node?.type === 'element' && node.tagName === 'div' && ((node.properties.className as string[] | undefined) ?? []).includes('divider');

const isBlank = (node: RootContent): boolean => node.type === 'text' && !node.value.trim();

/** A page's sections are set apart by the pixel divider: one before every H2 but the first, unless the page drew one there itself. */
export function sectionDividers() {
  return (tree: Root) => {
    let seen = false;
    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];
      if (node.type !== 'element' || (node as Element).tagName !== 'h2') continue;
      let before = i - 1;
      while (before >= 0 && isBlank(tree.children[before])) before--;
      if (seen && !isDivider(tree.children[before])) {
        tree.children.splice(i, 0, divider() as ElementContent as RootContent);
        i++;
      }
      seen = true;
    }
  };
}
