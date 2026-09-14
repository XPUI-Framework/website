import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Root } from 'mdast';
import { codeIndent, halveIndent } from './code-indent.ts';

test('an indent of four becomes two at every depth, and blank lines stay blank', () => {
  assert.equal(halveIndent('fn f() {\n    if x {\n        y();\n    }\n\n}'), 'fn f() {\n  if x {\n    y();\n  }\n\n}');
});

test('code indented in anything but fours, with tabs, or not at all is left as written', () => {
  for (const code of ['a:\n  b: 1', 'x\n\ty', 'fn f() {}', ' context\n+added']) assert.equal(halveIndent(code), code);
});

test('a text block keeps its spaces; a block naming a language is halved', () => {
  const tree: Root = {
    type: 'root',
    children: [
      { type: 'code', lang: 'text', meta: null, value: '|    |\n    ^' },
      { type: 'code', lang: 'rust', meta: null, value: 'fn f() {\n    g();\n}' },
    ],
  };
  codeIndent()(tree);
  assert.deepEqual(tree.children.map((n) => ('value' in n ? n.value : '')), ['|    |\n    ^', 'fn f() {\n  g();\n}']);
});
