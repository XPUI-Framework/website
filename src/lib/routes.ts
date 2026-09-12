/**
 * A page's URL is its path in the repository with the `docs/` folder and `.md` dropped:
 * `xpui/docs/tutorial.md` is `/docs/xpui/tutorial/`, and a `README.md` is its folder's page.
 */
export function routeOf(id: string): string {
  const segments = id.replace(/\.md$/, '').split('/');
  if (segments.at(-1) === 'README') segments.pop();
  if (segments.at(-2) === 'docs') segments.splice(-2, 1);
  return `/docs/${segments.join('/')}/`;
}

/** The `[...slug]` parameter for a page. */
export function slugOf(id: string): string {
  return routeOf(id).slice('/docs/'.length, -1);
}

/** Two pages must never land on one URL; returns the clashes, if any. */
export function collisions(ids: string[]): string[] {
  const seen = new Map<string, string>();
  const clashes: string[] = [];
  for (const id of ids) {
    const route = routeOf(id);
    const other = seen.get(route);
    if (other) clashes.push(`${other} and ${id} are both ${route}`);
    seen.set(route, id);
  }
  return clashes;
}
