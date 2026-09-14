import type { IndexEntry } from './reference-index.ts';

export interface NavEntry {
  page: string;
  label?: string;
}

/**
 * A repository's reference index: the pages its table links, in the table's order; with `byGroup`, the
 * menu shows them under the table's groups. The index page counts as listed but is not shown in the menu.
 */
export interface NavIndex {
  index: string;
  byGroup?: boolean;
}

/** A named run of pages: a group at the top of nav.json, or a subsection inside one. */
export interface NavGroup {
  label: string;
  pages: NavItem[];
}

export type NavItem = string | NavEntry | NavIndex | NavGroup;

export type ReadIndex = (id: string) => IndexEntry[];

/** The pages a nav item stands for, in order: a page is itself; an index is itself, then what its table links; a subsection is its pages. */
export function pagesOf(item: NavItem, readIndex: ReadIndex): NavEntry[] {
  if (typeof item === 'string') return [{ page: item }];
  if ('page' in item) return [item];
  if ('index' in item) return [{ page: item.index }, ...readIndex(item.index).map(({ page }) => ({ page }))];
  return item.pages.flatMap((child) => pagesOf(child, readIndex));
}

export interface Nav {
  groups: NavGroup[];
}

export interface NavPage {
  id: string;
  label: string;
  group: string;
}

/** The nav's pages in order, with each page's label (nav.json's, or the page's own title) and its top-level group. */
export function flatten(nav: Nav, titleOf: (id: string) => string, readIndex: ReadIndex = () => []): NavPage[] {
  return nav.groups.flatMap((group) =>
    group.pages
      .flatMap((item) => pagesOf(item, readIndex))
      .map(({ page, label }) => ({ id: page, label: label ?? titleOf(page), group: group.label })),
  );
}

/** What is wrong between the nav and the pages: an entry naming no page, a page in no entry, an entry twice. */
export function problems(
  nav: Nav,
  pages: string[],
  readIndex: ReadIndex = () => [],
): { missing: string[]; unlisted: string[]; repeated: string[] } {
  const listed = flatten(nav, (id) => id, readIndex).map((p) => p.id);
  return {
    missing: listed.filter((id) => !pages.includes(id)),
    unlisted: pages.filter((id) => !listed.includes(id)),
    repeated: listed.filter((id, i) => listed.indexOf(id) !== i),
  };
}

/** Every name the menu would show that is a crate's rather than a reader's (`xpui-boards-core`), with where it comes from. */
export function crateLabels(nav: Nav, titleOf: (id: string) => string, readIndex: ReadIndex = () => []): string[] {
  const found: string[] = [];
  const check = (label: string, where: string) => {
    if (/^xpui[-_]/i.test(label.trim())) found.push(`${where}: "${label}"`);
  };
  const walk = (items: NavItem[]) => {
    for (const item of items) {
      if (typeof item !== 'string' && 'pages' in item) {
        check(item.label, `the subsection "${item.label}"`);
        walk(item.pages);
      } else {
        for (const { page, label } of pagesOf(item, readIndex)) check(label ?? titleOf(page), page);
      }
    }
  };
  for (const group of nav.groups) {
    check(group.label, `the group "${group.label}"`);
    walk(group.pages);
  }
  return found;
}
