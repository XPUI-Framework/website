import { test } from 'node:test';
import assert from 'node:assert/strict';
import { repositoryRows } from './repos.ts';

test('each table row is a repository and its description', () => {
  const table = '| | |\n|---|---|\n| [`xpui-framework`](https://github.com/XPUI-Framework/xpui-framework) | The crate `xpui`: the framework |\n| [`xpui-dev`](https://github.com/XPUI-Framework/xpui-dev) | The umbrella |\n';
  assert.deepEqual(repositoryRows(table), [
    { github: 'xpui-framework', description: 'The crate `xpui`: the framework' },
    { github: 'xpui-dev', description: 'The umbrella' },
  ]);
});

test('a row is named by its URL, whatever its label says', () => {
  const table = '| | |\n|---|---|\n| [`chrome`](https://github.com/XPUI-Framework/xpui-chrome) | The eight themed components |\n| [xpui](https://github.com/XPUI-Framework/xpui-framework) | The framework itself |\n';
  assert.deepEqual(repositoryRows(table), [
    { github: 'xpui-chrome', description: 'The eight themed components' },
    { github: 'xpui-framework', description: 'The framework itself' },
  ]);
});
