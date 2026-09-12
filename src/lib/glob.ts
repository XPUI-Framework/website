/** `*` matches within one path segment, `**` across segments; everything else is literal. */
export function matches(pattern: string, path: string): boolean {
  const source = pattern
    .split(/(\*\*|\*)/)
    .map((part) => (part === '**' ? '.*' : part === '*' ? '[^/]*' : part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')))
    .join('');
  return new RegExp(`^${source}$`).test(path);
}

/** Whether a path is chosen by a list of patterns, where a leading `!` excludes. */
export function selects(patterns: string[], path: string): boolean {
  const include = patterns.filter((p) => !p.startsWith('!'));
  const exclude = patterns.filter((p) => p.startsWith('!')).map((p) => p.slice(1));
  return include.some((p) => matches(p, path)) && !exclude.some((p) => matches(p, path));
}
