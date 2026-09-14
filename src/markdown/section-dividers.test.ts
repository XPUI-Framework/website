import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Element, Root } from 'hast';
import { divider } from './pixel-rules.ts';
import { sectionDividers } from './section-dividers.ts';

const el = (tagName: string): Element => ({ type: 'element', tagName, properties: {}, children: [] });
const shape = (tree: Root) =>
  tree.children.filter((n): n is Element => n.type === 'element').map((n) => ((n.properties.className as string[] | undefined)?.includes('divider') ? 'divider' : n.tagName));

test('a divider goes before every section but the first', () => {
  const tree: Root = { type: 'root', children: [el('p'), el('h2'), el('p'), { type: 'text', value: '\n' }, el('h2'), el('h3'), el('h2')] };
  sectionDividers()(tree);
  assert.deepEqual(shape(tree), ['p', 'h2', 'p', 'divider', 'h2', 'h3', 'divider', 'h2']);
});

test('a section the page already set apart with --- gets no second divider', () => {
  const tree: Root = { type: 'root', children: [el('h2'), el('p'), divider(), { type: 'text', value: '\n' }, el('h2')] };
  sectionDividers()(tree);
  assert.deepEqual(shape(tree), ['h2', 'p', 'divider', 'h2']);
});
