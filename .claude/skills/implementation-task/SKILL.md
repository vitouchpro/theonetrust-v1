---
name: implementation-task
description: The standard way to implement any GitHub issue in this repo — inspect, plan, tests first, implement, verify, audit, report. Use for every feature or fix.
---

# Implementation task

## 1. Inspect (no edits)

- `gh issue view <n>`; read acceptance criteria and "Depends on" — dependencies must be merged.
- Read the referenced sections of `docs/website-plan.md`, `PROJECT_SPEC.md`, `docs/ux-design-brief.md`.
- Read the code you will touch and its existing tests. `git status` must be clean;
  `git switch -c feat/<n>-<slug>` from an up-to-date `main`.
- If a required fact is unverified (`[CONFIRM]`), stop and ask. Never invent it.

## 2. Plan (write it in the PR description draft)

- Files to add/change, API/data changes, risks, rollback.
- The **test matrix** from the `edge-case-matrix` skill. Each acceptance criterion → ≥ 1 test.

## 3. Tests first

- Write the tests (or delegate to the `test-engineer` agent). Run them; they should fail for the
  right reason before the implementation exists.

## 4. Implement

- Smallest coherent change. Reuse tokens, components, contracts and patterns.
- No hard-coded colours/sizes/URLs/limits; use tokens, env config or settings.
- Tamil + English strings together. No personal names anywhere.

## 5. Verify

- `pnpm verify` (full) — or `pnpm verify:quick` plus the affected Playwright specs while iterating.
- In the cloud sandbox: `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers pnpm test:e2e`.
- Look at screenshots for UI changes at 360 / 768 / 1440 px in both languages.

## 6. Audit

- Run the `change-audit` skill. Then the reviewer agents that apply:
  `change-auditor` always; `payment-security-reviewer` for money/auth/PII; `ui-a11y-reviewer` for UI.
- Fix every Critical/High finding and re-run the checks.

## 7. Report (PR description, using the template)

Files added/changed/deleted · behaviour changed · test matrix with results · exact commands run
and their outcome · screenshots · assumptions · remaining risks · rollback. Never claim a check
passed unless you ran it. Link `Closes #<n>`.
