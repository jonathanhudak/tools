// Single gate: every step must pass. Runs all steps (does not stop at the first failure)
// so an agent sees every problem at once, then exits non-zero if any failed.
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const steps = [
  ['typecheck (tsc -b)', 'typecheck'],
  ['lint (eslint, no inline config, 0 warnings)', 'lint'],
  ['cruise (dependency-cruiser)', 'arch:cruise'],
  ['arch tests (ArchUnitTS)', 'arch:test'],
  ['unit tests (vitest)', 'test'],
  ['canary (every rail still bites)', 'arch:canary'],
  ['cdk synth', 'synth'],
];

const results = [];
for (const [label, script] of steps) {
  const started = Date.now();
  console.log(`\n=== ${label} ===`);
  const { status } = spawnSync('pnpm', ['run', '--silent', script], { cwd: root, stdio: 'inherit' });
  results.push({ label, ok: status === 0, secs: ((Date.now() - started) / 1000).toFixed(1) });
}

console.log('\n=== verify summary ===');
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.label.padEnd(46)} ${r.secs}s`);
if (results.some((r) => !r.ok)) process.exit(1);
