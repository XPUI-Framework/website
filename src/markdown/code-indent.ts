import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

const indentOf = (line: string) => line.length - line.trimStart().length;

/** Code indented in fours shows indented in twos: the same shape, half as wide. Code indented any other way, or with tabs, is left as written. */
export function halveIndent(code: string): string {
  const lines = code.split('\n');
  const indents = lines.filter((line) => line.trim()).map(indentOf);
  if (lines.some((line) => /^\s*\t/.test(line)) || !indents.some((n) => n > 0) || indents.some((n) => n % 4 !== 0)) return code;
  return lines.map((line) => (line.trim() ? ' '.repeat(indentOf(line) / 2) + line.trimStart() : line)).join('\n');
}

/** Every fenced block that names a language; a `text` block is a drawing, and its spaces are the picture. */
export function codeIndent() {
  return (tree: Root) => {
    visit(tree, 'code', (node) => {
      if (!node.lang || node.lang === 'text') return;
      node.value = halveIndent(node.value);
    });
  };
}
