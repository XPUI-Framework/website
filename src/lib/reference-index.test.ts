import assert from 'node:assert/strict';
import { test } from 'node:test';
import { indexEntries } from './reference-index.ts';

test('a grouped index gives each page its group, carried down the rows that leave it blank', () => {
  const markdown = [
    '| Group | Page | Holds |',
    '|---|---|---|',
    '| App structure | [screens](reference/screens.md) | `Screen` |',
    '| | [app](reference/app.md) | `App` |',
    '| Components | [lists](reference/lists.md) | `List` |',
  ].join('\n');
  assert.deepEqual(indexEntries('xpui/docs/reference.md', markdown), [
    { page: 'xpui/docs/reference/screens.md', group: 'App structure' },
    { page: 'xpui/docs/reference/app.md', group: 'App structure' },
    { page: 'xpui/docs/reference/lists.md', group: 'Components' },
  ]);
});

test('a flat index gives its pages in order, without groups', () => {
  const markdown = '| Page | Holds |\n|---|---|\n| [plain chrome](reference/plain-chrome.md) | macro |\n| [icons](reference/icons.md) | `Icon` |';
  assert.deepEqual(indexEntries('xpui-chrome/docs/reference.md', markdown), [
    { page: 'xpui-chrome/docs/reference/plain-chrome.md' },
    { page: 'xpui-chrome/docs/reference/icons.md' },
  ]);
});

test('links within the page, prose links and repeats are not pages of the index', () => {
  const markdown = 'See [lists](reference/lists.md).\n\n| | |\n|---|---|\n| [`run`](#run) | runs |\n| [lists](reference/lists.md) | a |\n| [lists again](reference/lists.md) | b |';
  assert.deepEqual(indexEntries('xpui/docs/reference.md', markdown), [{ page: 'xpui/docs/reference/lists.md' }]);
});
