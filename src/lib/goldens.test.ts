import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { goldenFigure, pngSize } from './goldens.ts';

test('a PNG gives its size from its header', () => {
  assert.deepEqual(pngSize(readFileSync('content/xpui-gallery/gallery/tests/screenshots/menu_x3.png')), { width: 528, height: 792 });
});

test('anything that is not a PNG is refused', () => {
  assert.throws(() => pngSize(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>')), /not a PNG/);
  assert.throws(() => pngSize(new Uint8Array(8)), /not a PNG/);
});

test('a whole panel is drawn at half scale, either way up', () => {
  assert.deepEqual(goldenFigure({ width: 528, height: 792 }), { kind: 'panel', width: 264, height: 396 });
  assert.deepEqual(goldenFigure({ width: 792, height: 528 }), { kind: 'panel', width: 396, height: 264 });
});

test('a crop is drawn at twice its size', () => {
  assert.deepEqual(goldenFigure({ width: 480, height: 64 }), { kind: 'crop', width: 960, height: 128 });
  assert.deepEqual(goldenFigure({ width: 528, height: 700 }), { kind: 'crop', width: 1056, height: 1400 });
});
