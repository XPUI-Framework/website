import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ICONS, runs } from './icons.ts';

test('every icon is a 15 by 15 grid of ink and paper', () => {
  for (const [name, grid] of Object.entries(ICONS)) {
    assert.equal(grid.length, 15, name);
    for (const row of grid) assert.match(row, /^[#.]{15}$/, name);
  }
});

test('runs merge neighbouring pixels', () => {
  assert.deepEqual(runs(['##..#', '.....']), [[0, 0, 2], [4, 0, 1]]);
});
