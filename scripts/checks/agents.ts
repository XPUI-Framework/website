import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { type Findings, SITE } from './files.ts';

/** AGENTS.md lists exactly the stages the gate runs, in order. */
export function gateIsDocumented(ran: string[]): Findings {
  const text = readFileSync(join(SITE, 'AGENTS.md'), 'utf8');
  const list = text.split('## The gate')[1]?.match(/```text\n([\s\S]*?)```/)?.[1];
  if (!list) return ['AGENTS.md: no ```text stage list under "## The gate"'];
  const documented = list.split('·').map((s) => s.trim()).filter(Boolean);
  return documented.join(' · ') === ran.join(' · ') ? [] : [`AGENTS.md lists: ${documented.join(' · ')}`, `the gate runs: ${ran.join(' · ')}`];
}
