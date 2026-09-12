import { test } from 'node:test';
import assert from 'node:assert/strict';
import { diagramKey, mermaidFences, naturalSize, strayColours, toTwoTones } from './diagrams.ts';

test('fences are found and keyed by their text', () => {
  const md = '# T\n\n```mermaid\nflowchart BT\n  a --> b\n```\n\n```rust\nfn x() {}\n```\n';
  assert.deepEqual(mermaidFences(md), ['flowchart BT\n  a --> b\n']);
  assert.equal(diagramKey('a\n'), diagramKey('a'));
  assert.equal(diagramKey('a').length, 16);
});

test('the sentinels become the two tones, attributes move into style', () => {
  const svg = '<svg><style>#d1 .node rect{fill:#f0f1f2;stroke:#0A0B0C;}</style><path fill="#0a0b0c" d="M0"/><text style="font-size:14px" fill="rgb(10, 11, 12)">x</text></svg>';
  const out = toTwoTones(svg);
  assert.match(out, /fill:var\(--paper\);stroke:var\(--ink\)/);
  assert.match(out, /<path d="M0" style="fill:var\(--ink\)"\/>/);
  assert.match(out, /<text style="fill:var\(--ink\);font-size:14px">/);
  assert.deepEqual(strayColours(out), []);
});

test('any other colour is reported, and ids that look like hex are not', () => {
  assert.deepEqual(strayColours('<rect style="fill:#333"/><g stroke="red"/><use href="#d7a1b2c3"/>'), ['#333', 'red']);
  assert.deepEqual(strayColours('<rect fill="none" stroke="currentColor"/>'), []);
});

test('black is ink, white is paper, and a see-through tone is its tone', () => {
  const out = toTwoTones('<style>a{fill:#000;stroke:#000000}b{background-color:rgba(240, 241, 242, 0.5);color:white}</style><feDropShadow flood-color="#000000"/>');
  assert.equal(out, '<style>a{fill:var(--ink);stroke:var(--ink)}b{background-color:var(--paper);color:var(--paper)}</style><feDropShadow flood-color="var(--ink)"/>');
  assert.deepEqual(strayColours(out), []);
  assert.deepEqual(strayColours(toTwoTones('<rect style="fill:#0001"/>')), ['#0001']);
});

test('a diagram is given its drawn size', () => {
  const svg = '<svg id="d1" width="100%" style="max-width: 812.5px;" viewBox="-8 -8 812.5 300.25" role="graphics-document"><g/></svg>';
  assert.equal(naturalSize(svg), '<svg id="d1" viewBox="-8 -8 812.5 300.25" role="graphics-document" width="813" height="301"><g/></svg>');
});
