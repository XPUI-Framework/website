import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blobId, pageIds, serialise } from './manifest.ts';

test('blobId agrees with git hash-object', () => {
  assert.equal(blobId(Buffer.from('hello\n')), 'ce013625030ba8dba906f756967f9e9ca394464a');
});

test('serialise sorts keys at every level', () => {
  const text = serialise({ schema: 1, mermaid: '', diagrams: {}, repos: { b: { github: 'b', sha: 's', pushed: true, pages: true, files: { z: '1', a: '2' } }, a: { github: 'a', sha: 's', pushed: true, pages: false, files: {} } } });
  assert.ok(text.indexOf('"a"') < text.indexOf('"b"'));
  assert.ok(text.indexOf('"a": "2"') < text.indexOf('"z": "1"'));
});

test('pages are the markdown files of repositories that have pages', () => {
  const manifest = { schema: 1 as const, mermaid: '', diagrams: {}, repos: {
    xpui: { github: 'xpui-framework', sha: 's', pushed: true, pages: true, files: { 'README.md': '1', 'docs/a.md': '2', 'src/lib.rs': '3' } },
    brand: { github: 'brand', sha: 's', pushed: true, pages: false, files: { 'README.md': '4' } },
  } };
  assert.deepEqual(pageIds(manifest), ['xpui/README.md', 'xpui/docs/a.md']);
});
