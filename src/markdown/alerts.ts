import type { Blockquote, Root } from 'mdast';
import { visit } from 'unist-util-visit';

const LABELS: Record<string, string> = { NOTE: 'Note', TIP: 'Tip', IMPORTANT: 'Important', WARNING: 'Warning', CAUTION: 'Caution' };
const MARKER = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*\n?/;

/** GitHub's `> [!WARNING]` becomes the same markup as `Callout.astro`. */
export function alerts() {
  return (tree: Root) => {
    visit(tree, 'blockquote', (node: Blockquote) => {
      const paragraph = node.children[0];
      const text = paragraph?.type === 'paragraph' ? paragraph.children[0] : undefined;
      const match = text?.type === 'text' ? MARKER.exec(text.value) : null;
      if (!match || text?.type !== 'text' || paragraph.type !== 'paragraph') return;
      const label = LABELS[match[1]];
      text.value = text.value.slice(match[0].length);
      if (!text.value) paragraph.children.shift();
      if (!paragraph.children.length) node.children.shift();
      node.data = { hName: 'aside', hProperties: { className: ['callout'], ariaLabel: label } };
      node.children.unshift({ type: 'paragraph', data: { hProperties: { className: ['label'] } }, children: [{ type: 'text', value: label }] });
    });
  };
}
