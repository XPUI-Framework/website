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
