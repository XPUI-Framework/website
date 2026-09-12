import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BOARDS_FILE, CONTENT_DIR } from './manifest.ts';

export interface BoardButton {
  label: string;
  centre: [number, number];
  size: [number, number];
}

export interface Board {
  slug: string;
  name: string;
  width: number;
  height: number;
  bezel: { body: [number, number]; panelOrigin: [number, number]; panelSize: [number, number]; buttons: BoardButton[] } | null;
}

export function readBoards(root = process.cwd()): Board[] {
  return JSON.parse(readFileSync(join(root, CONTENT_DIR, BOARDS_FILE), 'utf8'));
}

export function board(slug: string, boards = readBoards()): Board {
  const found = boards.find((b) => b.slug === slug);
  if (!found?.bezel) throw new Error(`no board "${slug}" with a body in ${BOARDS_FILE}`);
  return found;
}

/**
 * The CSS size of a drawn device when its panel is shown at `scale` CSS pixels per panel pixel,
 * and where the panel sits in it, as fractions of the body.
 */
export function deviceLayout(device: Board, scale: number) {
  const bezel = device.bezel;
  if (!bezel) throw new Error(`${device.slug} has no body`);
  const perTenth = (device.width * scale) / bezel.panelSize[0];
  return {
    width: Math.round(bezel.body[0] * perTenth),
    height: Math.round(bezel.body[1] * perTenth),
    panel: {
      left: bezel.panelOrigin[0] / bezel.body[0],
      top: bezel.panelOrigin[1] / bezel.body[1],
      width: bezel.panelSize[0] / bezel.body[0],
      height: bezel.panelSize[1] / bezel.body[1],
    },
  };
}
