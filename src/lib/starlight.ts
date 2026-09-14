import { type Nav, type NavItem, type ReadIndex } from './nav.ts';
import { slugOf } from './routes.ts';
import { firstSentence, title } from './sections.ts';

/** A synced page's Starlight id: its route without the slashes, `xpui/docs/tutorial.md` → `docs/xpui/tutorial`. */
export function starlightId(id: string): string {
  return `docs/${slugOf(id)}`;
}

/** What Starlight needs of a synced page, which carries no front matter: its H1, its first sentence, where to edit it. */
export function pageData(id: string, body: string, editUrl: string): { title: string; description?: string; editUrl: string } {
  const description = firstSentence(body);
  return { title: title(body) || id, ...(description ? { description } : {}), editUrl };
}

export interface SidebarLink {
  slug: string;
  label?: string;
}

export interface SidebarGroup {
  label: string;
  collapsed?: boolean;
  items: (SidebarLink | SidebarGroup)[];
}

function link(page: string, label?: string): SidebarLink {
  return { slug: starlightId(page), ...(label ? { label } : {}) };
}

/**
 * A nav item as sidebar entries. A subsection is an open submenu. A reference index is the pages its
 * table links, where it stands; with `byGroup`, each under a closed submenu named by the table's group.
 * The index page itself stays out of the menu: the menu already lists what it lists.
 */
function itemsOf(item: NavItem, readIndex: ReadIndex): (SidebarLink | SidebarGroup)[] {
  if (typeof item === 'string') return [link(item)];
  if ('page' in item) return [link(item.page, item.label)];
  if ('pages' in item) return [{ label: item.label, items: item.pages.flatMap((child) => itemsOf(child, readIndex)) }];
  const entries = readIndex(item.index);
  if (!item.byGroup) return entries.map(({ page }) => link(page));
  const items: (SidebarLink | SidebarGroup)[] = [];
  for (const { page, group } of entries) {
    if (!group) {
      items.push(link(page));
      continue;
    }
    let submenu = items.find((i): i is SidebarGroup => 'items' in i && i.label === group);
    if (!submenu) {
      submenu = { label: group, collapsed: true, items: [] };
      items.push(submenu);
    }
    submenu.items.push(link(page));
  }
  return items;
}

/** nav.json as Starlight's sidebar: a group per nav group, subsections and reference indexes expanded in place. */
export function sidebar(nav: Nav, readIndex: ReadIndex = () => []): SidebarGroup[] {
  return nav.groups.map((group) => ({ label: group.label, items: group.pages.flatMap((item) => itemsOf(item, readIndex)) }));
}
