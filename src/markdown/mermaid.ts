import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Code, Root } from 'mdast';
import { visit } from 'unist-util-visit';
import { DIAGRAMS_DIR, diagramKey } from '../lib/diagrams.ts';
import { CONTENT_DIR } from '../lib/manifest.ts';

/** A mermaid fence becomes the SVG the sync drew for it, inline, so it takes the page's two tones. */
export function mermaid() {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code, index, parent) => {
      if (node.lang !== 'mermaid' || !parent || index === undefined) return;
      const key = diagramKey(node.value);
      let svg: string;
      try {
        svg = readFileSync(join(process.cwd(), CONTENT_DIR, DIAGRAMS_DIR, `${key}.svg`), 'utf8');
      } catch {
        throw new Error(`diagram ${key} is not drawn — run npm run sync`);
      }
      const natural = /<svg\b[^>]*\swidth="(\d+)"/.exec(svg)?.[1] ?? '0';
      parent.children[index] = { type: 'html', value: `<figure class="diagram" style="--natural:${natural}px">${svg}</figure>` };
    });
  };
}
