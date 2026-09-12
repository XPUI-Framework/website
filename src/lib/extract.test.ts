import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rustItem, rustItemWithin } from './extract.ts';

const source = `use x;

impl Screen for Timer {
    fn body(&self) {
        Text::new("a { brace in a string");
        let c = '}'; // and } in a comment
    }
}

fn after() {}`;

test('the item runs from its first line to its closing brace', () => {
  const item = rustItem(source, 'impl Screen for Timer');
  assert.equal(item.first, 3);
  assert.equal(item.last, 8);
  assert.ok(item.code.endsWith('    }\n}'));
  assert.ok(!item.code.includes('after'));
});

test('a missing item is an error, not an empty extract', () => {
  assert.throws(() => rustItem(source, 'impl View for Timer'), /no line/);
});

test('an item cut from inside an impl loses that indentation', () => {
  const item = rustItem(source, 'fn body(&self)');
  assert.ok(item.code.startsWith('fn body(&self) {\n    Text::new'));
  assert.ok(item.code.endsWith('\n}'));
});

test('an item is found inside the one that holds it, with the line numbers of the file', () => {
  const file = `impl Screen for A {
    fn body(&self) {
        first();
    }
}

impl Screen for B {
    fn body(&self) {
        second();
    }
}`;
  const b = rustItemWithin(file, 'impl Screen for B', 'fn body(&self)');
  assert.ok(b.code.includes('second()'));
  assert.equal(b.first, 8);
  assert.equal(b.last, 10);
});
