import { test } from 'node:test';
import assert from 'node:assert/strict';
import { alert, blocks, firstParagraph, firstSentence, plain, section, title } from './sections.ts';

const readme = `[![CI](x)](y) [![MIT](z)](LICENSE)

# \`xpui\`

> [!WARNING]
> Under heavy development.

A small *framework*: see [the host](docs/host.md).

\`\`\`rust
fn main() {

}
\`\`\`
`;

test('a blank line inside a fence does not split it', () => {
  assert.ok(blocks(readme).some((b) => b.startsWith('```rust') && b.endsWith('```')));
});

test('the title is the first H1, as plain text', () => {
  assert.equal(title(readme), 'xpui');
});

test('the first paragraph skips badges, headings and quotes', () => {
  assert.equal(firstParagraph(readme), 'A small *framework*: see [the host](docs/host.md).');
});

test('plain drops inline markup and keeps the words', () => {
  assert.equal(plain(firstParagraph(readme)), 'A small framework: see the host.');
});

test('a section runs to the next heading of its level', () => {
  const md = '# T\n\n## One\n\nfirst\n\n### Sub\n\nkept\n\n## Two\n\nnot this\n';
  assert.equal(section(md, 'One'), 'first\n\n### Sub\n\nkept');
  assert.throws(() => section(md, 'Three'), /no section/);
});

test('an alert is its lines, joined', () => {
  assert.equal(alert('# T\n\n> [!WARNING]\n> Under heavy\n> development.\n', 'WARNING'), 'Under heavy development.');
  assert.throws(() => alert('# T\n', 'WARNING'), /no \[!WARNING\]/);
});

test('a summary is the first sentence, not cut at a colon', () => {
  assert.equal(firstSentence('# T\n\nA small `thing`: it paints. More here.\n'), 'A small thing: it paints.');
  assert.equal(firstSentence('# T\n\nNo full stop\n'), 'No full stop');
});
