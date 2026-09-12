import { execFileSync } from 'node:child_process';

/** Read-only queries against one checkout. `--no-optional-locks` keeps even a status from touching its index. */
function git(dir: string, args: string[]): Buffer {
  return execFileSync('git', ['--no-optional-locks', '-C', dir, ...args], { maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
}

export function isCheckout(dir: string): boolean {
  try {
    return git(dir, ['rev-parse', '--is-inside-work-tree']).toString().trim() === 'true';
  } catch {
    return false;
  }
}

export function head(dir: string): string {
  return git(dir, ['rev-parse', 'HEAD']).toString().trim();
}

/** Whether a commit is reachable from `origin/main`, so a link to it resolves for everyone. */
export function isPushed(dir: string, sha: string): boolean {
  try {
    git(dir, ['merge-base', '--is-ancestor', sha, 'origin/main']);
    return true;
  } catch {
    return false;
  }
}

export function tree(dir: string, sha: string): { path: string; blob: string }[] {
  return git(dir, ['ls-tree', '-r', '-z', '--full-tree', sha])
    .toString()
    .split('\0')
    .filter(Boolean)
    .map((entry) => {
      const [meta, path] = entry.split('\t');
      return { path, blob: meta.split(' ')[2] };
    });
}

export function blob(dir: string, id: string): Buffer {
  return git(dir, ['cat-file', 'blob', id]);
}

/** Which of these paths have edits that are not in `HEAD`. */
export function uncommitted(dir: string, paths: string[]): string[] {
  if (!paths.length) return [];
  return git(dir, ['status', '--porcelain', '-z', '--', ...paths])
    .toString()
    .split('\0')
    .filter(Boolean)
    .map((line) => line.slice(3));
}

/** The commit a ref names, or undefined when there is no such ref. */
export function resolve(dir: string, ref: string): string | undefined {
  try {
    return git(dir, ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`]).toString().trim() || undefined;
  } catch {
    return undefined;
  }
}

/** How many commits `to` has that `from` does not. */
export function ahead(dir: string, from: string, to: string): number {
  return Number(git(dir, ['rev-list', '--count', `${from}..${to}`]).toString().trim());
}

/** The paths that differ between two commits. */
export function changedBetween(dir: string, from: string, to: string): string[] {
  return git(dir, ['diff', '--name-only', '-z', from, to]).toString().split('\0').filter(Boolean);
}
