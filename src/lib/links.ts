import { posix } from 'node:path';
import { routeOf } from './routes.ts';

const ORG = 'https://github.com/XPUI-Framework/';
const RAW = 'https://raw.githubusercontent.com/XPUI-Framework/';

export interface LinkContext {
  /** The repository directory and the file's path inside it. */
  dir: string;
  path: string;
  /** The commit the file was synced at, and its repository's GitHub name. */
  sha: string;
  github: string;
  /** Every page, as `<dir>/<path>`. */
  pages: Set<string>;
  /** GitHub repository name → directory, for every synced repository. */
  dirs: Map<string, string>;
  /** Every synced file, pages or not, as `<dir>/<path>`. */
  synced: Set<string>;
}

function splitFragment(href: string): [string, string] {
  const at = href.indexOf('#');
  return at < 0 ? [href, ''] : [href.slice(0, at), href.slice(at)];
}

/** The page a repository path names: the file itself, or a folder's README. */
function pageAt(dir: string, path: string, pages: Set<string>): string | undefined {
  const clean = path.replace(/\/$/, '');
  return [`${dir}/${clean}`, `${dir}/${clean ? `${clean}/` : ''}README.md`].find((id) => pages.has(id));
}

/**
 * Where a link in a synced page points on the site: another page's route when the target is
 * a page, the file on GitHub at the synced commit when it is anything else in the repository,
 * and unchanged when it leaves the repository by URL.
 */
export function rewrite(href: string, ctx: LinkContext): string {
  if (href.startsWith('#') || href.startsWith('/')) return href;
  const [target, fragment] = splitFragment(href);

  if (/^[a-z][a-z0-9+.-]*:/i.test(target)) {
    if (!target.startsWith(ORG)) return href;
    const [github, kind, ref, ...rest] = target.slice(ORG.length).replace(/\/$/, '').split('/');
    const dir = ctx.dirs.get(github);
    if (!dir) return href;
    if (kind === undefined) {
      const page = pageAt(dir, '', ctx.pages);
      return page ? routeOf(page) + fragment : href;
    }
    if ((kind === 'blob' || kind === 'tree') && ref === 'main') {
      const page = pageAt(dir, rest.join('/'), ctx.pages);
      if (page) return routeOf(page) + fragment;
    }
    return href;
  }

  const resolved = posix.normalize(posix.join(posix.dirname(ctx.path), target));
  if (resolved.startsWith('..')) throw new Error(`${ctx.dir}/${ctx.path}: "${href}" leaves the repository`);
  const inRepo = resolved === '.' ? '' : resolved.replace(/\/$/, '');
  const page = pageAt(ctx.dir, inRepo, ctx.pages);
  if (page) return routeOf(page) + fragment;
  const kind = target.endsWith('/') ? 'tree' : 'blob';
  return `${ORG}${ctx.github}/${kind}/${ctx.sha}/${inRepo}${fragment}`;
}

/**
 * Where an image in a synced page loads from. A raw URL on `main` in a synced repository names a
 * file the site holds, so it becomes that file's path relative to the page, and the build serves
 * the synced bytes. A raw URL for a file that is not synced stops the build. Any other absolute
 * URL is unchanged.
 */
export function imageSource(src: string, ctx: LinkContext): string {
  if (!src.startsWith(RAW)) return src;
  const [github, ref, ...rest] = src.slice(RAW.length).split(/[?#]/)[0].split('/');
  const dir = ctx.dirs.get(github);
  if (!dir || ref !== 'main' || !rest.length) return src;
  const file = `${dir}/${rest.join('/')}`;
  if (!ctx.synced.has(file)) throw new Error(`${ctx.dir}/${ctx.path}: ${file} is not synced — add it to sources.json`);
  const local = posix.relative(posix.dirname(`${ctx.dir}/${ctx.path}`), file);
  return local.startsWith('../') ? local : `./${local}`;
}
