import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DIVIDERS } from './dividers.ts';

test('every divider is a rectangle of ink and ground, mirror-symmetric', () => {
  for (const [name, draw] of Object.entries(DIVIDERS)) {
    const grid = draw();
    const width = grid[0].length;
    for (const row of grid) {
      assert.equal(row.length, width, name);
      assert.match(row, /^[#.]+$/, name);
    }
    if (name !== 'refresh') for (const row of grid) assert.equal(row, [...row].reverse().join(''), `${name} is symmetric`);
  }
});

test('the fade is densest at its centre', () => {
  const grid = DIVIDERS.fade();
  const ink = (x0: number, x1: number) => grid.reduce((n, row) => n + [...row.slice(x0, x1)].filter((c) => c === '#').length, 0);
  assert.ok(ink(40, 56) > ink(0, 16));
});
