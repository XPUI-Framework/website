import { test } from 'node:test';
import assert from 'node:assert/strict';
import { llmsFull, llmsIndex } from './llms.ts';

test('the index lists every page with its summary', () => {
  const text = llmsIndex('XPUI', 'A framework.', [{ label: 'Start here', pages: [{ id: 'a', label: 'Tutorial', href: '/docs/xpui/tutorial/' }] }], new Map([['a', 'From nothing.']]));
  assert.equal(text, '# XPUI\n\n> A framework.\n\n## Start here\n\n- [Tutorial](https://xpui.rs/docs/xpui/tutorial/): From nothing.\n\n## Optional\n\n- [Every page in one file](https://xpui.rs/llms-full.txt)\n');
});

test('the full text heads each page with its URL and source', () => {
  assert.equal(llmsFull([{ href: '/docs/a/', source: 'x@1 README.md', body: '# A\n' }]), '<!-- https://xpui.rs/docs/a/ — from x@1 README.md -->\n\n# A\n');
});
