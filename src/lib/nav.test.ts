import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flatten, neighbours, problems } from './nav.ts';

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

test('previous and next follow the flattened order across groups', () => {
  const order = flatten(nav, (id) => id);
  const { previous, next } = neighbours(order, 'a/docs/t.md');
  assert.equal(previous?.id, 'a/README.md');
  assert.equal(next?.id, 'b/README.md');
  assert.equal(neighbours(order, 'a/README.md').previous, undefined);
});

test('missing, unlisted and repeated entries are all reported', () => {
  const found = problems({ groups: [{ label: 'x', pages: ['a/README.md', 'gone.md', 'a/README.md'] }] }, ['a/README.md', 'new.md']);
  assert.deepEqual(found, { missing: ['gone.md'], unlisted: ['new.md'], repeated: ['a/README.md'] });
});
