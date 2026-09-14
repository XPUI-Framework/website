/** A golden's size in pixels, read from the PNG itself, and the size a synced page draws it at. */

export interface Size {
  width: number;
  height: number;
}

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Width and height from the IHDR chunk, which a PNG must put first: bytes 16 to 23. */
export function pngSize(bytes: Uint8Array): Size {
  const ihdr = String.fromCharCode(...bytes.subarray(12, 16));
  if (bytes.length < 24 || SIGNATURE.some((b, i) => bytes[i] !== b) || ihdr !== 'IHDR') throw new Error('not a PNG');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

/** The Xteink X3's panel: `Device.astro` draws a golden this size. */
const PANEL: Size = { width: 528, height: 792 };

/**
 * A golden as large as the X3's panel, either way up, is a whole panel and is drawn at half a CSS
 * pixel per panel pixel, as the home page draws one. Anything smaller is a component cropped out
 * of a panel, drawn at two CSS pixels per panel pixel so its pixels read.
 */
export function goldenFigure({ width, height }: Size): { kind: 'panel' | 'crop'; width: number; height: number } {
  const panel =
    Math.min(width, height) >= Math.min(PANEL.width, PANEL.height) && Math.max(width, height) >= Math.max(PANEL.width, PANEL.height);
  const scale = panel ? 0.5 : 2;
  return { kind: panel ? 'panel' : 'crop', width: width * scale, height: height * scale };
}
