import type { Code, Root } from 'mdast';
import { visit } from 'unist-util-visit';

/**
 * rustdoc's rule for a doctest's lines: `# …` and a lone `#` are hidden setup, `##…` shows as
 * `#…`, everything else shows. `#[derive]` is not hidden: there is no space after the `#`.
 */
export function visibleRust(code: string): string {
  return code
    .split('\n')
    .flatMap((line) => {
      const trimmed = line.trimStart();
      if (trimmed.startsWith('##')) return [line.replace('##', '#')];
      if (trimmed === '#' || trimmed.startsWith('# ')) return [];
      return [line];
    })
    .join('\n');
}

/** A ```rust,no_run fence highlights as rust and shows what rustdoc would show. Other languages are untouched. */
export function rustdocFences() {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code) => {
      if (node.lang?.split(',')[0] !== 'rust') return;
      node.lang = 'rust';
      node.value = visibleRust(node.value);
    });
  };
}
