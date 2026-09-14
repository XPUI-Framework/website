import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Image, Paragraph, Root } from 'mdast';
import { processor, shared } from './index.ts';
import { links } from './links.ts';

const RAW = 'https://raw.githubusercontent.com/XPUI-Framework/xpui-gallery/main/';
// A reference page that is not synced, below docs/, so the image's path crosses folders to a synced golden.
const page = join(process.cwd(), 'content', 'xpui-gallery', 'docs', 'reference', 'fixture.md');

const withImage = (url: string): Root => ({
  type: 'root',
  children: [{ type: 'paragraph', children: [{ type: 'image', url, alt: 'The menu' }] }],
});

test('a synced golden is served from the site, wrapped and sized by its pixels', () => {
  const tree = withImage(`${RAW}gallery/tests/screenshots/menu_x3.png`);
  links()(tree, { path: page });
  const [wrapper] = (tree.children[0] as Paragraph).children;
  assert.equal(wrapper.type, 'emphasis');
  assert.deepEqual(wrapper.data, { hName: 'span', hProperties: { className: ['golden', 'golden-panel'] } });
  const image = (wrapper as { children: Image[] }).children[0];
  assert.equal(image.url, '../../gallery/tests/screenshots/menu_x3.png');
  assert.deepEqual(image.data, { hProperties: { width: 264, height: 396 } });
});

test('a golden that is not synced stops the build, naming sources.json', () => {
  assert.throws(() => links()(withImage(`${RAW}gallery/tests/screenshots/reference/lists.png`), { path: page }), /is not synced — add it to sources\.json/);
});

test('another site\'s image is left alone, and a relative one still stops the build', () => {
  const tree = withImage('https://raw.githubusercontent.com/rust-lang/rust/main/logo.png');
  links()(tree, { path: page });
  assert.equal(((tree.children[0] as Paragraph).children[0] as Image).url, 'https://raw.githubusercontent.com/rust-lang/rust/main/logo.png');
  assert.throws(() => links()(withImage('menu.png'), { path: page }), /relative image "menu.png" has no home on the site/);
});

test('through the whole pipeline, the golden is a local image Astro will serve', async () => {
  const renderer = await processor.createRenderer(shared);
  const { code, metadata } = await renderer.render(`![The menu](${RAW}gallery/tests/screenshots/menu_x3.png)\n`, { fileURL: pathToFileURL(page) });
  assert.deepEqual(metadata.localImagePaths, ['../../gallery/tests/screenshots/menu_x3.png']);
  assert.match(code, /<span class="golden golden-panel"><img __ASTRO_IMAGE_="[^"]*&#x22;src&#x22;:&#x22;..\/..\/gallery\/tests\/screenshots\/menu_x3.png&#x22;/);
  assert.match(code, /&#x22;width&#x22;:264,&#x22;height&#x22;:396/);
  assert.doesNotMatch(code, /raw\.githubusercontent\.com/);
});
