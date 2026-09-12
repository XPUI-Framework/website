/**
 * A Rust item cut out of a file by its first line: from the line that starts with `header`
 * to the brace that closes it. Strings, chars and `//` comments are skipped while counting.
 */
export function rustItem(source: string, header: string): { code: string; first: number; last: number } {
  const lines = source.split('\n');
  const first = lines.findIndex((line) => line.trimStart().startsWith(header));
  if (first < 0) throw new Error(`no line starting with "${header}"`);
  let depth = 0;
  let opened = false;
  for (let i = first; i < lines.length; i += 1) {
    const code = lines[i].replace(/\/\/.*$/, '').replace(/"(?:\\.|[^"\\])*"/g, '""').replace(/'(?:\\.|[^'\\])'/g, "''");
    for (const ch of code) {
      if (ch === '{') {
        depth += 1;
        opened = true;
      } else if (ch === '}') {
        depth -= 1;
      }
    }
    if (opened && depth === 0) return { code: dedent(lines.slice(first, i + 1)), first: first + 1, last: i + 1 };
  }
  throw new Error(`"${header}" never closes`);
}

/** Strips the indentation every non-blank line shares, so an item cut from inside an `impl` starts at the margin. */
function dedent(lines: string[]): string {
  const indents = lines.filter((l) => l.trim()).map((l) => l.length - l.trimStart().length);
  const common = Math.min(...indents);
  return lines.map((l) => l.slice(Math.min(common, l.length - l.trimStart().length))).join('\n');
}

/** An item inside another, named by both, so a file with several `fn body` is unambiguous. */
export function rustItemWithin(source: string, within: string, header: string): { code: string; first: number; last: number } {
  const outer = rustItem(source, within);
  const inner = rustItem(outer.code, header);
  return { code: inner.code, first: outer.first + inner.first - 1, last: outer.first + inner.last - 1 };
}
