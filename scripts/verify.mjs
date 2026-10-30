#!/usr/bin/env node
/**
 * One command that runs the full quality gate in the same order as CI.
 *   pnpm verify         → everything incl. build + Playwright (all viewports)
 *   pnpm verify:quick   → format, lint, typecheck, unit tests, tests-required gate
 * Prints a summary table and exits non-zero on the first failing step.
 */
import { spawnSync } from 'node:child_process';

const quick = process.argv.includes('--quick');

const steps = [
  ['format', 'pnpm', ['format:check']],
  ['lint', 'pnpm', ['lint']],
  ['typecheck', 'pnpm', ['typecheck']],
  ['script tests', 'pnpm', ['test:scripts']],
  [quick ? 'unit tests' : 'unit tests + coverage', 'pnpm', [quick ? 'test' : 'test:coverage']],
  ['tests-required gate', 'pnpm', ['check:tests-required']],
  ...(quick
    ? []
    : [
        ['build', 'pnpm', ['build']],
        ['e2e (5 viewports + auto bug detector)', 'pnpm', ['test:e2e']],
      ]),
];

const results = [];
for (const [name, cmd, args] of steps) {
  const started = Date.now();
  console.log(`\n▶ ${name}`);
  const run = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  results.push({ name, ok: run.status === 0, seconds });
  if (run.status !== 0) break;
}

console.log('\n── verify summary ──');
for (const r of results) console.log(`${r.ok ? '✔' : '✖'} ${r.name.padEnd(42)} ${r.seconds}s`);
const skipped = steps.length - results.length;
if (skipped) console.log(`… ${skipped} step(s) not run after the failure`);

process.exit(results.every((r) => r.ok) && !skipped ? 0 : 1);
