#!/usr/bin/env node
/**
 * PostToolUse hook (Edit/Write/MultiEdit).
 * - BLOCKS (exit 2) when the edited file looks like it contains a secret or a PAN.
 * - BLOCKS when `git diff --check` finds conflict markers / whitespace errors in the file.
 * - Otherwise adds a reminder to Claude's context when production source was
 *   edited, so tests for success/failure/edge cases are written alongside.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { findSecrets, isProductionSource, isSecretScanExempt } from './lib.mjs';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const filePath = input?.tool_input?.file_path;
if (!filePath || !existsSync(filePath)) process.exit(0);

const rel = relative(root, filePath);
const problems = [];

if (!isSecretScanExempt(rel)) {
  const secrets = findSecrets(readFileSync(filePath, 'utf8'));
  if (secrets.length) problems.push(`${rel} appears to contain: ${secrets.join(', ')}. Remove it.`);
}

try {
  execFileSync('git', ['diff', '--check', '--', rel], { cwd: root, stdio: 'pipe' });
} catch (error) {
  problems.push(`git diff --check failed for ${rel}:\n${error.stdout?.toString() ?? ''}`);
}

if (problems.length) {
  console.error(`post-edit-audit blocked this edit:\n- ${problems.join('\n- ')}`);
  process.exit(2);
}

if (isProductionSource(rel)) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: `You edited production source (${rel}). Update or add tests in the same package covering success, failure and edge cases (edge-case-matrix skill). The Stop gate will run pnpm verify:quick.`,
      },
    }),
  );
}
