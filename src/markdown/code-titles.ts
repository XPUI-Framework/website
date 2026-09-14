import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

const NAMES: Record<string, string> = {
  rust: 'Rust',
  toml: 'TOML',
  bash: 'Shell',
  sh: 'Shell',
  shell: 'Shell',
  console: 'Shell',
  c: 'C',
  cpp: 'C++',
  'c++': 'C++',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  ini: 'INI',
  cmake: 'CMake',
  python: 'Python',
  diff: 'Diff',
  html: 'HTML',
  css: 'CSS',
  js: 'JavaScript',
  ts: 'TypeScript',
  markdown: 'Markdown',
  md: 'Markdown',
};

/** A code block is headed by the language its fence names; a picture drawn in `text` stays unheaded. */
export function codeTitles() {
  return (tree: Root) => {
    visit(tree, 'code', (node) => {
      const lang = node.lang?.toLowerCase();
      if (!lang || lang === 'text' || /\btitle=/.test(node.meta ?? '')) return;
      const title = `title="${NAMES[lang] ?? lang}"`;
      node.meta = node.meta ? `${node.meta} ${title}` : title;
    });
  };
}
