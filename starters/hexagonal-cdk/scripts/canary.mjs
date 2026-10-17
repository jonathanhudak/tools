// ENFORCEMENT - human-owned. Proves every enforcement layer still bites.
//
// 1. Copies the starter (minus node_modules/dist) to a temp dir and links node_modules.
// 2. Overlays canary/fixtures/** onto the copy, so each violation sits in a REAL ring folder.
// 3. Runs tsc -b, ESLint, dependency-cruiser and the ArchUnitTS suite against the copy.
// 4. Fails if ANY expectation in canary/expectations.json is not reported.
// The real working tree is never modified.
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const { fixtures } = JSON.parse(readFileSync(join(root, 'canary', 'expectations.json'), 'utf8'));
const SKIP = new Set(['node_modules', 'dist', 'dist-test', 'dist-tooling', 'cdk.out', '.canary-tmp']);

const work = mkdtempSync(join(tmpdir(), 'hex-canary-'));
const bin = (name) => join(root, 'node_modules', '.bin', name);
const run = (cmd, args) => spawnSync(bin(cmd), args, { cwd: work, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const results = [];
const expect = (file, tool, what, ok) => results.push({ file, tool, what, ok });

try {
  // Copy sources but keep per-package node_modules (they hold only relative pnpm symlinks).
  cpSync(root, work, {
    recursive: true,
    verbatimSymlinks: true,
    filter: (src) => {
      const rel = relative(root, src);
      if (rel === 'node_modules') return false;
      return !rel.split('/').some((seg) => SKIP.has(seg) && seg !== 'node_modules');
    },
  });
  symlinkSync(join(root, 'node_modules'), join(work, 'node_modules'), 'dir');
  cpSync(join(root, 'canary', 'fixtures'), work, { recursive: true });
  const files = Object.keys(fixtures);

  // --- tsc -b -------------------------------------------------------------
  const tsc = run('tsc', ['-b', '--pretty', 'false']);
  const tscOut = tsc.stdout + tsc.stderr;
  for (const [file, exp] of Object.entries(fixtures)) {
    if (exp.tsc) expect(file, 'tsc', 'compile error', tscOut.split('\n').some((l) => l.startsWith(file)));
  }

  // --- ESLint ---------------------------------------------------------------
  const eslint = run('eslint', ['--no-inline-config', '--format', 'json', ...files]);
  let lint = [];
  try {
    lint = JSON.parse(eslint.stdout);
  } catch {
    console.error(eslint.stdout, eslint.stderr);
  }
  for (const [file, exp] of Object.entries(fixtures)) {
    const msgs = lint.find((r) => relative(work, r.filePath) === file)?.messages ?? [];
    for (const rule of exp.eslint ?? []) expect(file, 'eslint', rule, msgs.some((m) => m.ruleId === rule));
  }

  // --- dependency-cruiser ---------------------------------------------------
  const cruise = run('depcruise', ['packages', 'infra', '--config', '.dependency-cruiser.cjs', '--output-type', 'json']);
  let violations = [];
  try {
    violations = JSON.parse(cruise.stdout).summary.violations;
  } catch {
    console.error(cruise.stdout.slice(0, 2000), cruise.stderr);
  }
  for (const [file, exp] of Object.entries(fixtures)) {
    for (const rule of exp.cruise ?? []) {
      expect(file, 'cruise', rule, violations.some((v) => v.rule.name === rule && (v.from === file || v.cycle?.some((c) => c.name === file))));
    }
  }

  // --- ArchUnitTS -----------------------------------------------------------
  const outFile = join(work, 'arch-report.json');
  run('vitest', ['run', '--project', 'arch', '--reporter=json', `--outputFile=${outFile}`]);
  let failedTitles = new Set();
  try {
    const report = JSON.parse(readFileSync(outFile, 'utf8'));
    failedTitles = new Set(report.testResults.flatMap((f) => f.assertionResults).filter((a) => a.status === 'failed').map((a) => a.title));
  } catch (e) {
    console.error('could not read arch report', e);
  }
  for (const [file, exp] of Object.entries(fixtures)) {
    for (const title of exp.arch ?? []) expect(file, 'arch', title, failedTitles.has(title));
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

const pad = (s, n) => String(s).padEnd(n);
for (const r of results) console.log(`${r.ok ? 'CAUGHT ' : 'MISSED '} ${pad(r.tool, 7)} ${pad(r.what, 58)} ${r.file}`);
const missed = results.filter((r) => !r.ok);
console.log(`\ncanary: ${results.length - missed.length}/${results.length} planted violations reported`);
if (missed.length > 0 || results.length === 0) {
  console.error('canary FAILED: an enforcement layer has stopped biting. Do not weaken the canary - fix the rule.');
  process.exit(1);
}
