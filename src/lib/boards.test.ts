import { test } from 'node:test';
import assert from 'node:assert/strict';
import { type Board, deviceLayout } from './boards.ts';

const x4: Board = {
  slug: 'x4', name: 'Xteink X4', width: 480, height: 800,
  bezel: { body: [580, 1020], panelOrigin: [80, 80], panelSize: [420, 700], buttons: [] },
};

test('the panel is shown at the asked scale, and the body grows around it in proportion', () => {
  const layout = deviceLayout(x4, 0.5);
  assert.equal(Math.round(layout.width * layout.panel.width), 240);
  assert.equal(layout.width, 331);
  assert.equal(layout.height, 583);
  assert.ok(Math.abs(layout.panel.left - 80 / 580) < 1e-9);
});

test('a board with no body cannot be drawn', () => {
  assert.throws(() => deviceLayout({ ...x4, bezel: null }, 0.5), /no body/);
});
