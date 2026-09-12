import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { type Nav, type NavPage, flatten, problems } from './nav.ts';
import { routeOf } from './routes.ts';
import { title } from './sections.ts';

export interface SidebarGroup {
  label: string;
  pages: { label: string; href: string; id: string }[];
}

/** The nav, checked against the pages that exist: a nav entry that names no page stops the build. */
export function siteNav(bodies: Map<string, string>): { order: NavPage[]; groups: SidebarGroup[] } {
  const nav: Nav = JSON.parse(readFileSync(join(process.cwd(), 'nav.json'), 'utf8'));
  const { missing, repeated } = problems(nav, [...bodies.keys()]);
  if (missing.length) throw new Error(`nav.json names pages that are not synced: ${missing.join(', ')}`);
  if (repeated.length) throw new Error(`nav.json lists a page twice: ${repeated.join(', ')}`);
  const order = flatten(nav, (id) => title(bodies.get(id) ?? ''));
  const groups = nav.groups.map((group) => ({
    label: group.label,
    pages: order.filter((p) => p.group === group.label).map((p) => ({ label: p.label, href: routeOf(p.id), id: p.id })),
  }));
  return { order, groups };
}
