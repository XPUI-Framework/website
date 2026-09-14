import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crateLabels, flatten, problems } from './nav.ts';

const nav = {
  groups: [
    { label: 'Start here', pages: ['a/README.md', { page: 'a/docs/t.md', label: 'Tutorial' }] },
    { label: 'More', pages: ['b/README.md'] },
  ],
};

test('labels come from nav.json, or from the page', () => {
  const order = flatten(nav, (id) => `title of ${id}`);
  assert.deepEqual(order.map((p) => [p.label, p.group]), [['title of a/README.md', 'Start here'], ['Tutorial', 'Start here'], ['title of b/README.md', 'More']]);
});

test('a subsection and an index inside it give their pages in order, under the top-level group', () => {
  const nested = {
    groups: [{ label: 'The backends', pages: ['b/README.md', { label: 'FreeInkUI', pages: ['b/fui/README.md', { index: 'b/fui/docs/reference.md' }] }] }],
  };
  const order = flatten(nested, (id) => id, () => [{ page: 'b/fui/docs/reference/raw.md' }]);
  assert.deepEqual(order.map((p) => [p.id, p.group]), [
    ['b/README.md', 'The backends'],
    ['b/fui/README.md', 'The backends'],
    ['b/fui/docs/reference.md', 'The backends'],
    ['b/fui/docs/reference/raw.md', 'The backends'],
  ]);
});

test('missing, unlisted and repeated entries are all reported', () => {
  const found = problems({ groups: [{ label: 'x', pages: ['a/README.md', 'gone.md', 'a/README.md'] }] }, ['a/README.md', 'new.md']);
  assert.deepEqual(found, { missing: ['gone.md'], unlisted: ['new.md'], repeated: ['a/README.md'] });
});

test('a crate name in the menu is reported wherever it comes from: a label, a title, a subsection, an index table', () => {
  const titles: Record<string, string> = { 'c/README.md': 'xpui-boards-core', 'd/README.md': 'Boards', 'e/docs/reference/x.md': 'xpui_eg::Backend' };
  const menu = {
    groups: [
      { label: 'The boards', pages: ['c/README.md', 'd/README.md', { page: 'd/docs/a.md', label: 'xpui-screenshot' }] },
      { label: 'The backends', pages: [{ label: 'xpui-fui', pages: [{ index: 'e/docs/reference.md' }] }] },
    ],
  };
  assert.deepEqual(crateLabels(menu, (id) => titles[id] ?? 'Reference', () => [{ page: 'e/docs/reference/x.md' }]), [
    'c/README.md: "xpui-boards-core"',
    'd/docs/a.md: "xpui-screenshot"',
    'the subsection "xpui-fui": "xpui-fui"',
    'e/docs/reference/x.md: "xpui_eg::Backend"',
  ]);
});
