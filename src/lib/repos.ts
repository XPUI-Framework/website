/** The org profile's repository table, `| [`name`](url) | what it is |`, as rows. */
export function repositoryRows(markdown: string): { github: string; description: string }[] {
  return [...markdown.matchAll(/^\|\s*\[`([^`]+)`\]\(https:\/\/github\.com\/XPUI-Framework\/[^)]+\)\s*\|\s*(.+?)\s*\|\s*$/gm)].map((m) => ({
    github: m[1],
    description: m[2],
  }));
}
