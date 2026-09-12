export interface NavEntry {
  page: string;
  label?: string;
}

export interface NavGroup {
  label: string;
  pages: (string | NavEntry)[];
}

export interface Nav {
  groups: NavGroup[];
}

export interface NavPage {
  id: string;
  label: string;
  group: string;
}

/** The sidebar in order, with each page's label: nav.json's, or the page's own title. */
export function flatten(nav: Nav, titleOf: (id: string) => string): NavPage[] {
  return nav.groups.flatMap((group) =>
    group.pages.map((entry) => {
      const { page, label } = typeof entry === 'string' ? { page: entry, label: undefined } : entry;
      return { id: page, label: label ?? titleOf(page), group: group.label };
    }),
  );
}

/** What is wrong between the nav and the pages: an entry naming no page, a page in no entry, an entry twice. */
export function problems(nav: Nav, pages: string[]): { missing: string[]; unlisted: string[]; repeated: string[] } {
  const listed = flatten(nav, (id) => id).map((p) => p.id);
  return {
    missing: listed.filter((id) => !pages.includes(id)),
    unlisted: pages.filter((id) => !listed.includes(id)),
    repeated: listed.filter((id, i) => listed.indexOf(id) !== i),
  };
}

export function neighbours(order: NavPage[], id: string): { previous?: NavPage; next?: NavPage } {
  const at = order.findIndex((p) => p.id === id);
  if (at < 0) return {};
  return { previous: order[at - 1], next: order[at + 1] };
}
