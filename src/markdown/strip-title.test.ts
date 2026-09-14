import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Element, Root } from 'hast';
import { stripTitle } from './strip-title.ts';

const heading = (tagName: string, id: string): Element => ({ type: 'element', tagName, properties: { id }, children: [{ type: 'text', value: id }] });
const elements = (tree: Root) => tree.children.filter((n): n is Element => n.type === 'element');

test('the opening H1 goes, its id stays on an empty anchor, and the page under it keeps its ids', () => {
  const tree: Root = { type: 'root', children: [{ type: 'text', value: '\n' }, heading('h1', 'input'), heading('h2', 'input-1')] };
  stripTitle()(tree);
  assert.deepEqual(elements(tree).map((n) => [n.tagName, n.properties.id, n.children.length]), [['span', 'input', 0], ['h2', 'input-1', 1]]);
});

test('an H1 that does not open the page is left alone', () => {
  const tree: Root = { type: 'root', children: [heading('p', 'intro'), heading('h1', 'later')] };
  stripTitle()(tree);
  assert.deepEqual(elements(tree).map((n) => n.tagName), ['p', 'h1']);
});
