import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pageData, sidebar, starlightId } from './starlight.ts';

test('a page keeps its site route', () => {
  assert.equal(starlightId('xpui/docs/tutorial.md'), 'docs/xpui/tutorial');
  assert.equal(starlightId('xpui/README.md'), 'docs/xpui');
  assert.equal(starlightId('xpui/docs/reference/lists.md'), 'docs/xpui/reference/lists');
  assert.equal(starlightId('xpui-backends/fui/docs/firmware.md'), 'docs/xpui-backends/fui/firmware');
});

test('a page without front matter gets its title, summary and edit link from the file', () => {
  const body = '# `xpui`\n\nA screen is written once. It runs anywhere.\n';
  assert.deepEqual(pageData('xpui/README.md', body, 'https://github.com/x/y/edit/main/README.md'), {
    title: 'xpui',
    description: 'A screen is written once.',
    editUrl: 'https://github.com/x/y/edit/main/README.md',
  });
  assert.equal(pageData('xpui/docs/empty.md', 'no heading', 'https://e').title, 'xpui/docs/empty.md');
});

test('the sidebar keeps nav.json order and labels', () => {
  const nav = { groups: [{ label: 'Start here', pages: [{ page: 'xpui/README.md', label: 'Overview' }, 'xpui/docs/tutorial.md'] }] };
  assert.deepEqual(sidebar(nav), [
    { label: 'Start here', items: [{ slug: 'docs/xpui', label: 'Overview' }, { slug: 'docs/xpui/tutorial' }] },
  ]);
});

test('a subsection is an open submenu inside its group', () => {
  const nav = {
    groups: [{ label: 'The backends', pages: ['xpui-backends/README.md', { label: 'FreeInkUI', pages: ['xpui-backends/fui/README.md'] }] }],
  };
  assert.deepEqual(sidebar(nav), [
    { label: 'The backends', items: [{ slug: 'docs/xpui-backends' }, { label: 'FreeInkUI', items: [{ slug: 'docs/xpui-backends/fui' }] }] },
  ]);
});

test('an index grouped by its table is a closed submenu per group, without the index page', () => {
  const nav = { groups: [{ label: 'Reference', pages: [{ index: 'xpui/docs/reference.md', byGroup: true }] }] };
  const readIndex = () => [
    { page: 'xpui/docs/reference/screens.md', group: 'App structure' },
    { page: 'xpui/docs/reference/lists.md', group: 'Components' },
    { page: 'xpui/docs/reference/dialogs.md', group: 'Components' },
  ];
  assert.deepEqual(sidebar(nav, readIndex), [
    {
      label: 'Reference',
      items: [
        { label: 'App structure', collapsed: true, items: [{ slug: 'docs/xpui/reference/screens' }] },
        { label: 'Components', collapsed: true, items: [{ slug: 'docs/xpui/reference/lists' }, { slug: 'docs/xpui/reference/dialogs' }] },
      ],
    },
  ]);
});

test('any other index puts its pages where it stands, groups or not', () => {
  const nav = { groups: [{ label: 'Themed components', pages: ['xpui-chrome/README.md', { index: 'xpui-chrome/docs/reference.md' }] }] };
  const readIndex = () => [
    { page: 'xpui-chrome/docs/reference/painting.md', group: 'Painting' },
    { page: 'xpui-chrome/docs/reference/icons.md' },
  ];
  assert.deepEqual(sidebar(nav, readIndex), [
    {
      label: 'Themed components',
      items: [{ slug: 'docs/xpui-chrome' }, { slug: 'docs/xpui-chrome/reference/painting' }, { slug: 'docs/xpui-chrome/reference/icons' }],
    },
  ]);
});
