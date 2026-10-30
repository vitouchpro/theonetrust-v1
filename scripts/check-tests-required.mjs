#!/usr/bin/env node
/**
 * Tests-required gate.
 *
 * Fails when production source in a workspace package changed but no test in
 * that same package changed. This forces every behaviour change to arrive with
 * success, failure and edge-case tests.
 *
 * Escape hatch (rare, must be justified in review): put a line
 *   Tests-Not-Needed: <reason>
 * in the PR description (CI passes it via TESTS_NOT_NEEDED_REASON).
 */
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SOURCE = /^(apps|packages)\/([^/]+)\/src\/.+\.(ts|tsx|css)$/;
const TEST = /^(apps|packages)\/([^/]+)\/(.+\.(test|spec)\.(ts|tsx)|e2e\/.+\.ts|src\/test\/.+)$/;
const NOT_BEHAVIOUR = /(\.d\.ts$|\/src\/test\/)/;

/** Pure decision function — unit tested in check-tests-required.test.mjs. */
export function evaluate(files) {
  const sourceByPkg = new Map();
  const testedPkgs = new Set();

  for (const file of files) {
    const test = TEST.exec(file);
    if (test) {
      testedPkgs.add(`${test[1]}/${test[2]}`);
      continue;
    }
    const src = SOURCE.exec(file);
    if (src && !NOT_BEHAVIOUR.test(file)) {
      const pkg = `${src[1]}/${src[2]}`;
      sourceByPkg.set(pkg, [...(sourceByPkg.get(pkg) ?? []), file]);
    }
  }

  const missing = [...sourceByPkg.entries()]
    .filter(([pkg]) => !testedPkgs.has(pkg))
    .map(([pkg, changed]) => ({ pkg, changed }));

  return { ok: missing.length === 0, missing, checkedPackages: [...sourceByPkg.keys()] };
}

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).split('\n').filter(Boolean);
}

function hasCommit(ref) {
  try {
    execFileSync('git', ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], {
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

function changedFiles(baseRef) {
  const files = new Set();
  const add = (list) => list.forEach((f) => files.add(f));

  if (!hasCommit('HEAD')) {
    // Brand-new repository: everything staged or untracked counts as changed.
    add(git(['ls-files', '--cached', '--others', '--exclude-standard']));
    return [...files];
  }
  if (hasCommit(baseRef)) {
    const mergeBase = git(['merge-base', baseRef, 'HEAD'])[0];
    add(git(['diff', '--name-only', '--diff-filter=ACMR', `${mergeBase}...HEAD`]));
  } else {
    console.warn(`check-tests-required: base "${baseRef}" not found; checking local changes only.`);
  }
  // Include uncommitted and untracked work so the gate also runs locally / in hooks.
  add(git(['diff', '--name-only', '--diff-filter=ACMR', 'HEAD']));
  add(git(['ls-files', '--others', '--exclude-standard']));
  return [...files];
}

function main() {
  const reason = process.env.TESTS_NOT_NEEDED_REASON?.trim();
  const baseRef = process.env.BASE_REF ?? 'origin/main';
  const result = evaluate(changedFiles(baseRef));

  if (result.ok) {
    console.log(
      `✔ tests-required: ${result.checkedPackages.length ? result.checkedPackages.join(', ') : 'no source changes'}`,
    );
    return;
  }
  if (reason) {
    console.warn(`⚠ tests-required bypassed: "${reason}" — reviewer must confirm.`);
    return;
  }
  console.error('✖ tests-required: source changed without tests in the same package:\n');
  for (const { pkg, changed } of result.missing) {
    console.error(`  ${pkg}\n${changed.map((f) => `    - ${f}`).join('\n')}`);
  }
  console.error(
    '\nAdd tests covering the success path, failure paths and edge cases (see .claude/skills/edge-case-matrix).',
  );
  process.exit(1);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
