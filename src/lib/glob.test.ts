import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matches, selects } from './glob.ts';

test('a star stays inside one segment', () => {
  assert.ok(matches('docs/*.md', 'docs/tutorial.md'));
  assert.ok(!matches('docs/*.md', 'docs/nested/tutorial.md'));
  assert.ok(matches('*/README.md', 'core/README.md'));
  assert.ok(!matches('*/README.md', 'README.md'));
});

test('a double star crosses segments', () => {
  assert.ok(matches('assets/**', 'assets/a/b.svg'));
});

test('everything else is literal', () => {
  assert.ok(matches('profile/README.md', 'profile/README.md'));
  assert.ok(!matches('profile/README.md', 'profileXREADME.md'));
  assert.ok(!matches('controls_x3.png', 'controls_open_x3.png'));
});

test('a leading ! excludes what the others include', () => {
  const patterns = ['docs/*.md', '!docs/contributing.md'];
  assert.ok(selects(patterns, 'docs/tutorial.md'));
  assert.ok(!selects(patterns, 'docs/contributing.md'));
  assert.ok(!selects(patterns, 'README.md'));
});
