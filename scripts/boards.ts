import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as git from './git.ts';

const EXPORTER = join(import.meta.dirname, '..', 'tools', 'boards', 'src', 'main.rs');
const TARGET = join(import.meta.dirname, '..', 'node_modules', '.cache', 'xpui-site-boards');
const XPUI_URL = 'https://github.com/XPUI-Framework/xpui-framework';

/** What the board data depends on: both commits and the exporter itself. */
export function boardsKey(boardsSha: string, xpuiSha: string): string {
  return createHash('sha256').update(`${boardsSha}\n${xpuiSha}\n${readFileSync(EXPORTER, 'utf8')}`).digest('hex');
}

function unpack(repo: string, sha: string, into: string): void {
  mkdirSync(into, { recursive: true });
  execFileSync('tar', ['-x', '-C', into], { input: git.archive(repo, sha), maxBuffer: 256 * 1024 * 1024 });
}

/**
 * Builds the exporter against `xpui-boards` and `xpui` at the synced commits — unpacked from git,
 * never the working trees, and offline — and returns its JSON.
 */
export function exportBoards(boardsRepo: string, boardsSha: string, xpuiRepo: string, xpuiSha: string): string {
  const work = mkdtempSync(join(tmpdir(), 'xpui-site-boards-'));
  try {
    unpack(boardsRepo, boardsSha, join(work, 'xpui-boards'));
    unpack(xpuiRepo, xpuiSha, join(work, 'xpui'));
    const crate = join(work, 'exporter');
    mkdirSync(join(crate, 'src'), { recursive: true });
    copyFileSync(EXPORTER, join(crate, 'src', 'main.rs'));
    copyFileSync(join(work, 'xpui-boards', 'rust-toolchain.toml'), join(crate, 'rust-toolchain.toml'));
    const board = (name: string) => `xpui-boards-${name} = { path = "${join(work, 'xpui-boards', name)}" }`;
    writeFileSync(
      join(crate, 'Cargo.toml'),
      [
        '[package]',
        'name = "xpui-site-boards"',
        'version = "0.0.0"',
        'edition = "2024"',
        'publish = false',
        '',
        '[dependencies]',
        board('core'),
        board('pimoroni'),
        board('seeed'),
        board('xteink'),
        '',
        `[patch."${XPUI_URL}"]`,
        `xpui = { path = "${join(work, 'xpui')}" }`,
        '',
        '[workspace]',
        '',
      ].join('\n'),
    );
    const run = spawnSync('cargo', ['run', '--quiet', '--offline', '--release'], {
      cwd: crate,
      encoding: 'utf8',
      env: { ...process.env, CARGO_TARGET_DIR: TARGET },
      maxBuffer: 16 * 1024 * 1024,
    });
    if (run.status !== 0) throw new Error(`the board exporter failed:\n${run.stderr.trim().split('\n').slice(-15).join('\n')}`);
    return `${JSON.stringify(JSON.parse(run.stdout), null, 2)}\n`;
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}
