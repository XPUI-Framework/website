import { test } from 'node:test';
import assert from 'node:assert/strict';
import { visibleRust } from './rustdoc-fences.ts';

test('setup lines are hidden and attributes are not', () => {
  const code = [
    '# xpui::testing::install();',
    '# #[derive(Copy, Clone)]',
    '# enum Glyph { Sun = 0 }',
    '#',
    '#[derive(Clone, Copy)]',
    'enum Msg { Set(i32) }',
    '    # let hidden = 1;',
  ].join('\n');
  assert.equal(visibleRust(code), '#[derive(Clone, Copy)]\nenum Msg { Set(i32) }');
});

test('a doubled hash is the escape for a literal one', () => {
  assert.equal(visibleRust('## not hidden\n##[attr]'), '# not hidden\n#[attr]');
});
