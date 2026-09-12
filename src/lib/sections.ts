/** Slicing a synced markdown file without rendering it. Code fences are never split or read as prose. */

export function blocks(markdown: string): string[] {
  const out: string[] = [];
  let current: string[] = [];
  let fenced = false;
  for (const line of markdown.split('\n')) {
    if (line.startsWith('```')) fenced = !fenced;
    if (!fenced && line.trim() === '') {
      if (current.length) out.push(current.join('\n'));
      current = [];
    } else {
      current.push(line);
    }
  }
  if (current.length) out.push(current.join('\n'));
  return out;
}

export function title(markdown: string): string {
  const heading = blocks(markdown).find((block) => block.startsWith('# '));
  return heading ? plain(heading.slice(2)) : '';
}

const NOT_PROSE = /^(#|>|\||<|```|\s*[-*] |\[!\[)/;

/** The first block that is a plain paragraph: not a heading, quote, table, list, HTML, fence or badge line. */
export function firstParagraph(markdown: string): string {
  return blocks(markdown).find((block) => !NOT_PROSE.test(block)) ?? '';
}

export function plain(markdown: string): string {
  return markdown
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The blocks under `## heading`, up to the next heading of the same level or higher. */
export function section(markdown: string, heading: string): string {
  const all = blocks(markdown);
  const start = all.findIndex((block) => block === `## ${heading}`);
  if (start < 0) throw new Error(`no section "## ${heading}"`);
  const end = all.findIndex((block, i) => i > start && /^#{1,2} /.test(block));
  return all.slice(start + 1, end < 0 ? undefined : end).join('\n\n');
}

/** The text of a GitHub alert, `> [!WARNING]`, as one line. */
export function alert(markdown: string, kind: string): string {
  const block = blocks(markdown).find((b) => b.startsWith(`> [!${kind}]`));
  if (!block) throw new Error(`no [!${kind}] alert`);
  return block.split('\n').slice(1).map((line) => line.replace(/^>\s?/, '')).join(' ').trim();
}

/** A page's one-line summary: its first paragraph's first sentence, as plain text. */
export function firstSentence(markdown: string): string {
  const text = plain(firstParagraph(markdown));
  const end = text.search(/[.!?](\s|$)/);
  return end < 0 ? text : text.slice(0, end + 1);
}
