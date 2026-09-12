import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stripSections } from './strip-sections.ts';
import type { Root } from 'mdast';

const heading = (depth: 1 | 2 | 3, value: string) => ({ type: 'heading' as const, depth, children: [{ type: 'text' as const, value }] });
const para = (value: string) => ({ type: 'paragraph' as const, children: [{ type: 'text' as const, value }] });

test('a licence section goes, with everything under it, and the next section stays', () => {
  const tree: Root = { type: 'root', children: [heading(1, 'Title'), para('intro'), heading(2, 'License'), para('MIT'), heading(3, 'Third party'), para('also gone'), heading(2, 'Where next'), para('kept')] };
  stripSections()(tree);
  assert.deepEqual(tree.children.map((n) => ('depth' in n ? `h${n.depth}:` : '') + ('children' in n && n.children[0] && 'value' in n.children[0] ? n.children[0].value : '')), ['h1:Title', 'intro', 'h2:Where next', 'kept']);
});

test('a page with no licence section is untouched', () => {
  const tree: Root = { type: 'root', children: [heading(1, 'Title'), para('intro')] };
  stripSections()(tree);
  assert.equal(tree.children.length, 2);
});
