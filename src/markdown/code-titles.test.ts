import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Root } from 'mdast';
import { codeTitles } from './code-titles.ts';

const code = (lang: string | null, meta: string | null = null) => ({ type: 'code' as const, lang, meta, value: 'x' });

test('a fenced block is titled with its language', () => {
  const tree: Root = { type: 'root', children: [code('rust'), code('bash'), code('toml', 'ignore')] };
  codeTitles()(tree);
  assert.deepEqual(tree.children.map((n) => ('meta' in n ? n.meta : null)), ['title="Rust"', 'title="Shell"', 'ignore title="TOML"']);
});

test('text, an unnamed fence, and a block that names its own title are left as they are', () => {
  const tree: Root = { type: 'root', children: [code('text'), code(null), code('rust', 'title="main.rs"')] };
  codeTitles()(tree);
  assert.deepEqual(tree.children.map((n) => ('meta' in n ? n.meta : null)), [null, null, 'title="main.rs"']);
});
