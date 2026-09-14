import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { gateIsDocumented } from './checks/agents.ts';
import { syncedContentMatches } from './checks/content.ts';
import { followsTheStandard } from './checks/copy.ts';
import { type Findings, SITE } from './checks/files.ts';
import { twoTones } from './checks/palette.ts';
import { withinBudget } from './checks/weight.ts';
import { internalLinksResolve } from './checks/links.ts';
import { everyPageInTheNav, noCrateLabels } from './checks/nav.ts';

interface Stage {
  name: string;
  needsBuild?: boolean;
  run: () => Findings | { findings: Findings; notes: string[] };
}

function command(bin: string, args: string[]): Findings {
  const result = spawnSync(join(SITE, 'node_modules', '.bin', bin), args, { cwd: SITE, encoding: 'utf8', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } });
  return result.status === 0 ? [] : `${result.stdout}${result.stderr}`.trim().split('\n').slice(-40);
}

function node(args: string[]): Findings {
  const result = spawnSync(process.execPath, args, { cwd: SITE, encoding: 'utf8' });
  return result.status === 0 ? [] : `${result.stdout}${result.stderr}`.trim().split('\n').slice(-40);
}

const stages: Stage[] = [
  { name: 'synced content matches the manifest', run: syncedContentMatches },
  { name: 'types', run: () => command('astro', ['check']) },
  { name: 'unit tests', run: () => node(['--test']) },
  { name: 'build', run: () => command('astro', ['build', '--force']) },
  { name: 'every synced page is in the nav', run: everyPageInTheNav },
  { name: 'no menu label is a crate name', run: noCrateLabels },
  { name: 'internal links resolve', needsBuild: true, run: internalLinksResolve },
  { name: 'pages within budget', needsBuild: true, run: withinBudget },
  { name: 'two tones', run: twoTones },
  { name: 'site copy follows the standard', needsBuild: true, run: followsTheStandard },
];

if (!existsSync(join(SITE, 'node_modules'))) {
  console.error('node_modules is missing: run npm ci first');
  process.exit(1);
}

let failed = false;
let built = true;
const ran: string[] = [];

function report(name: string, outcome: Findings | { findings: Findings; notes: string[] }) {
  const { findings, notes } = Array.isArray(outcome) ? { findings: outcome, notes: [] } : outcome;
  console.log(`${findings.length ? 'FAILED' : 'ok    '}  ${name}`);
  for (const line of [...findings, ...notes]) console.log(`        ${line}`);
  if (findings.length) failed = true;
  return findings.length === 0;
}

for (const stage of stages) {
  ran.push(stage.name);
  if (stage.needsBuild && !built) {
    console.log(`skipped ${stage.name}: the build failed`);
    failed = true;
    continue;
  }
  const passed = report(stage.name, stage.run());
  if (stage.name === 'build') built = passed;
}
ran.push('the gate is documented');
report('the gate is documented', gateIsDocumented(ran));

process.exit(failed ? 1 : 0);
