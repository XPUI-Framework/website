import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collisions, routeOf, slugOf } from './routes.ts';

test('a doc drops its docs folder and extension', () => {
  assert.equal(routeOf('xpui/docs/tutorial.md'), '/docs/xpui/tutorial/');
  assert.equal(routeOf('xpui-backends/fui/docs/design.md'), '/docs/xpui-backends/fui/design/');
});

test('a README is its folder', () => {
  assert.equal(routeOf('xpui/README.md'), '/docs/xpui/');
  assert.equal(routeOf('xpui-boards/core/README.md'), '/docs/xpui-boards/core/');
});

test('slugs are routes without the prefix', () => {
  assert.equal(slugOf('xpui/README.md'), 'xpui');
  assert.equal(slugOf('xpui/docs/host.md'), 'xpui/host');
});

test('two pages on one URL are reported', () => {
  assert.deepEqual(collisions(['a/docs/x.md', 'a/x/README.md']), ['a/docs/x.md and a/x/README.md are both /docs/a/x/']);
  assert.deepEqual(collisions(['a/docs/x.md', 'a/docs/y.md']), []);
});
