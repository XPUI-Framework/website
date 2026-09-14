import { test } from 'node:test';
import assert from 'node:assert/strict';
import { imageSource, type LinkContext, rewrite } from './links.ts';

const sha = 'a'.repeat(40);
const ctx: LinkContext = {
  dir: 'xpui',
  path: 'docs/tutorial.md',
  sha,
  github: 'xpui-framework',
  pages: new Set(['xpui/README.md', 'xpui/docs/host.md', 'xpui/docs/tutorial.md', 'xpui-gallery/tutorial/README.md']),
  dirs: new Map([['xpui-framework', 'xpui'], ['xpui-gallery', 'xpui-gallery']]),
  synced: new Set(['xpui/README.md', 'xpui-gallery/gallery/tests/screenshots/menu_x3.png']),
};
const readme: LinkContext = { ...ctx, path: 'README.md' };

test('fragments, absolute paths, mail and other sites are left alone', () => {
  for (const href of ['#layout', '/docs/', 'mailto:contact@xpui.rs', 'https://docs.rs/xpui', 'https://github.com/rust-lang/rust']) {
    assert.equal(rewrite(href, ctx), href);
  }
});

test('a relative link to a page becomes its route, fragment kept', () => {
  assert.equal(rewrite('host.md', ctx), '/docs/xpui/host/');
  assert.equal(rewrite('host.md#the-five-traits', ctx), '/docs/xpui/host/#the-five-traits');
  assert.equal(rewrite('docs/tutorial.md', readme), '/docs/xpui/tutorial/');
  assert.equal(rewrite('../README.md', ctx), '/docs/xpui/');
});

test('a relative link to anything else goes to GitHub at the synced commit', () => {
  assert.equal(rewrite('../src/view/mod.rs', ctx), `https://github.com/XPUI-Framework/xpui-framework/blob/${sha}/src/view/mod.rs`);
  assert.equal(rewrite('xtask/', readme), `https://github.com/XPUI-Framework/xpui-framework/tree/${sha}/xtask`);
  assert.equal(rewrite('LICENSE', readme), `https://github.com/XPUI-Framework/xpui-framework/blob/${sha}/LICENSE`);
});

test('a GitHub link on main to a synced page becomes its route', () => {
  assert.equal(rewrite('https://github.com/XPUI-Framework/xpui-framework/blob/main/docs/host.md#pitfalls', ctx), '/docs/xpui/host/#pitfalls');
  assert.equal(rewrite('https://github.com/XPUI-Framework/xpui-gallery/tree/main/tutorial', ctx), '/docs/xpui-gallery/tutorial/');
  assert.equal(rewrite('https://github.com/XPUI-Framework/xpui-framework', ctx), '/docs/xpui/');
});

test('a GitHub link to something that is not a page is left pointing at main', () => {
  const href = 'https://github.com/XPUI-Framework/xpui-framework/blob/main/src/lib.rs';
  assert.equal(rewrite(href, ctx), href);
  assert.equal(rewrite('https://github.com/XPUI-Framework/xpui-chrome', ctx), 'https://github.com/XPUI-Framework/xpui-chrome');
});

test('a relative link out of the repository is an error', () => {
  assert.throws(() => rewrite('../../other/x.md', ctx), /leaves the repository/);
});

const RAW = 'https://raw.githubusercontent.com/XPUI-Framework/';
const reference: LinkContext = { ...ctx, path: 'docs/reference/lists.md' };

test('a raw image in a synced repository becomes the synced file, relative to the page', () => {
  assert.equal(imageSource(`${RAW}xpui-gallery/main/gallery/tests/screenshots/menu_x3.png`, reference), '../../../xpui-gallery/gallery/tests/screenshots/menu_x3.png');
  const gallery: LinkContext = { ...ctx, dir: 'xpui-gallery', github: 'xpui-gallery', path: 'README.md' };
  assert.equal(imageSource(`${RAW}xpui-gallery/main/gallery/tests/screenshots/menu_x3.png`, gallery), './gallery/tests/screenshots/menu_x3.png');
});

test('a raw image that is not synced stops the build', () => {
  assert.throws(() => imageSource(`${RAW}xpui-gallery/main/gallery/tests/screenshots/reference/lists.png`, reference), /xpui-gallery\/gallery\/tests\/screenshots\/reference\/lists.png is not synced — add it to sources.json/);
});

test('any other absolute image is left alone', () => {
  for (const src of [
    'https://raw.githubusercontent.com/rust-lang/rust/main/src/doc/logo.png',
    `${RAW}xpui-chrome/main/docs/x.png`,
    `${RAW}xpui-gallery/v1/gallery/tests/screenshots/menu_x3.png`,
    'https://xpui.rs/social.png',
  ]) {
    assert.equal(imageSource(src, reference), src);
  }
});
