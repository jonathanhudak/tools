// PostToolUse hook: after Claude edits a file in this starter, lint it and cruise its ring,
// and feed any architecture violation back to Claude (exit 2 + stderr).
// Reads the hook payload (JSON) on stdin; uses tool_input.file_path.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..', '..');
let payload = {};
try {
  payload = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}
const filePath = payload?.tool_input?.file_path ?? payload?.tool_input?.notebook_path;
if (typeof filePath !== 'string') process.exit(0);

const abs = resolve(payload.cwd ?? root, filePath);
const rel = relative(root, abs);
if (rel.startsWith('..') || !/\.(ts|mjs|cjs|js)$/.test(rel) || !existsSync(abs)) process.exit(0);
if (rel.startsWith('canary/') || rel.split('/').includes('node_modules')) process.exit(0);

const bin = (name) => resolve(root, 'node_modules', '.bin', name);
const problems = [];

const lint = spawnSync(bin('eslint'), ['--no-inline-config', '--max-warnings', '0', rel], { cwd: root, encoding: 'utf8' });
if (lint.status !== 0) problems.push(`ESLint:\n${lint.stdout}${lint.stderr}`);

const ring = rel.match(/^(packages\/[^/]+|infra)\//)?.[1];
if (ring) {
  const cruise = spawnSync(bin('depcruise'), ['packages', 'infra', '--config', '.dependency-cruiser.cjs', '--focus', `^${rel}$`], {
    cwd: root,
    encoding: 'utf8',
  });
  if (cruise.status !== 0) problems.push(`dependency-cruiser:\n${cruise.stdout}${cruise.stderr}`);
}

if (problems.length > 0) {
  process.stderr.write(
    `Architecture check failed for ${rel}. Fix the code, not the rules: enforcement config is read-only. ` +
      `If a boundary blocks you, define a port in packages/domain/src/ports and implement it in packages/adapters-driven.\n\n` +
      problems.join('\n'),
  );
  process.exit(2);
}
