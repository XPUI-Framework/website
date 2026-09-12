import type { SidebarGroup } from './docs.ts';

const SITE = 'https://xpui.rs';

/** llmstxt.org's index: the title, the one-line summary, and every page by group. */
export function llmsIndex(title: string, summary: string, groups: SidebarGroup[], summaries: Map<string, string>): string {
  const sections = groups.map(
    (group) => `## ${group.label}\n\n${group.pages.map((p) => `- [${p.label}](${SITE}${p.href}): ${summaries.get(p.id) ?? ''}`.trimEnd()).join('\n')}`,
  );
  return `# ${title}\n\n> ${summary}\n\n${sections.join('\n\n')}\n\n## Optional\n\n- [Every page in one file](${SITE}/llms-full.txt)\n`;
}

/** Every page's markdown in nav order, each headed by where it lives and where it came from. */
export function llmsFull(pages: { href: string; source: string; body: string }[]): string {
  return pages.map((p) => `<!-- ${SITE}${p.href} — from ${p.source} -->\n\n${p.body.trim()}\n`).join('\n\n');
}
