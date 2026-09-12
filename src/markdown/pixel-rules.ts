import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';
import { DEFAULT_DIVIDER, DIVIDERS } from '../lib/dividers.ts';
import { runs } from '../lib/icons.ts';

/** A markdown `---` becomes the site's pixel divider, the same drawing as `Divider.astro`. */
export function pixelRules() {
  const grid = DIVIDERS[DEFAULT_DIVIDER]();
  const [width, height] = [grid[0].length, grid.length];
  const svg: Element = {
    type: 'element',
    tagName: 'svg',
    properties: { viewBox: `0 0 ${width} ${height}`, width: width * 2, height: height * 2, fill: 'currentColor', shapeRendering: 'crispEdges', ariaHidden: 'true' },
    children: runs(grid).map(([x, y, w]): Element => ({ type: 'element', tagName: 'rect', properties: { x: String(x), y: String(y), width: String(w), height: '1' }, children: [] })),
  };
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'hr' || !parent || index === undefined) return;
      parent.children[index] = { type: 'element', tagName: 'div', properties: { className: ['divider', 'flanked'], role: 'separator' }, children: [structuredClone(svg)] };
    });
  };
}
