#!/usr/bin/env node
/**
 * Stop hook: before Claude finishes a turn with uncommitted changes, run the
 * quick quality gate. If it fails, exit 2 so Claude must keep working and fix it.
 * Skips when there are no changes, and when Claude is already continuing
 * because of this hook (stop_hook_active) to avoid infinite loops.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { shouldRunStopGate, tail } from './lib.mjs';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

const status = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
if (!shouldRunStopGate(input, status.trim().length > 0)) process.exit(0);

const run = spawnSync('pnpm', ['-s', 'verify:quick'], { cwd: root, encoding: 'utf8' });
if (run.status === 0) process.exit(0);

console.error(
  `Stop gate: \`pnpm verify:quick\` failed. Fix the cause (do not weaken tests), then finish.\n\n${tail(
    `${run.stdout ?? ''}\n${run.stderr ?? ''}`,
  )}`,
);
process.exit(2);
