import { posix } from 'node:path';

export interface IndexEntry {
  page: string;
  group?: string;
}

const PAGE_LINK = /\]\(([^)#\s]+\.md)\)/;

/**
 * The pages a repository's reference index links from its tables, in order, each with the group a
 * `Group | Page | Holds` table puts it in. A table with no group column gives ungrouped pages; an index
 * that links only within itself gives none.
 */
export function indexEntries(indexId: string, markdown: string): IndexEntry[] {
  const dir = posix.dirname(indexId);
  const seen = new Set<string>();
  const entries: IndexEntry[] = [];
  let group: string | undefined;
  for (const line of markdown.split('\n')) {
    const row = line.trim().match(/^\|(.*)\|$/);
    if (!row) continue;
    const cells = row[1].split('|').map((cell) => cell.trim());
    const at = cells.findIndex((cell) => PAGE_LINK.test(cell));
    if (at < 0) continue;
    if (at > 0 && cells[0]) group = cells[0];
    const page = posix.normalize(posix.join(dir, cells[at].match(PAGE_LINK)![1]));
    if (seen.has(page)) continue;
    seen.add(page);
    entries.push(at > 0 && group ? { page, group } : { page });
  }
  return entries;
}
