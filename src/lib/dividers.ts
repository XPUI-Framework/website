/**
 * Pixel-art dividers, drawn as grids like the mark: `#` is ink, `.` is the ground.
 * Each is symmetric and a few pixels tall; the page draws a logical pixel as two CSS pixels.
 */

/** 4×4 Bayer thresholds: the order a dither turns pixels on as a tone darkens. */
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function fromFunction(width: number, height: number, on: (x: number, y: number) => boolean): string[] {
  return Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => (on(x, y) ? '#' : '.')).join(''));
}

/** Dense at the centre, thinning through an ordered dither to nothing at both ends; drawn by halves so it mirrors. */
function fade(): string[] {
  const half = 48;
  const left = fromFunction(half, 4, (x, y) => BAYER[y % 4][x % 4] < Math.round((x / (half - 1)) ** 1.6 * 14));
  return left.map((row) => row + [...row].reverse().join(''));
}

/** A run of stitches, with a diamond at the centre. */
function stitch(): string[] {
  const diamond = ['..#..', '.###.', '#####', '.###.', '..#..'];
  const stitches = (n: number) => Array.from({ length: n }, () => '##..').join('');
  const side = stitches(8);
  return diamond.map((row, y) => (y === 2 ? `${side}..${row}..${side.split('').reverse().join('')}` : `${'.'.repeat(side.length + 2)}${row}${'.'.repeat(side.length + 2)}`));
}

/** The mark's own X, from its 16-pixel drawing. */
function mark(): string[] {
  return ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'];
}

/** A line caught mid-refresh: solid, then a hard edge, then a checkerboard. */
function refresh(): string[] {
  const half = 48;
  return fromFunction(half * 2, 2, (x, y) => (x < half ? true : (x + y) % 2 === 0));
}

/** Plates stepping up to the centre and down again: the stack, seen side on. */
function stair(): string[] {
  const steps = 5;
  const tread = 6;
  const width = steps * tread * 2;
  return fromFunction(width, steps, (x, y) => {
    const fromEdge = Math.min(x, width - 1 - x);
    const level = Math.min(steps - 1, Math.floor(fromEdge / tread));
    return y === steps - 1 - level;
  });
}

export const DIVIDERS = { fade, stitch, mark, refresh, stair } as const;

export type DividerName = keyof typeof DIVIDERS;

/** The divider the site draws wherever it does not name one. */
export const DEFAULT_DIVIDER: DividerName = 'stitch';
