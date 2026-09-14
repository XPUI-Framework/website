/** The org profile's repository table, `| [label](https://github.com/XPUI-Framework/name) | what it is |`, as rows named by the URL. */
export function repositoryRows(markdown: string): { github: string; description: string }[] {
  return [...markdown.matchAll(/^\|\s*\[[^\]]+\]\(https:\/\/github\.com\/XPUI-Framework\/([^)/]+)\)\s*\|\s*(.+?)\s*\|\s*$/gm)].map((m) => ({
    github: m[1],
    description: m[2],
  }));
}
