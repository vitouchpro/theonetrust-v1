---
name: change-audit
description: Audit the current branch diff for missed edits, stale references after deletions, unintended behaviour changes and weakened safety nets. Use before every PR and after any refactor.
---

# Change audit

1. `git fetch origin main` then:
   - `git status --short`
   - `git diff --check origin/main...HEAD`
   - `git diff --stat origin/main...HEAD` and `git diff --name-status origin/main...HEAD`
   - read the full patch: `git diff origin/main...HEAD`
2. For each **deleted or renamed** symbol, file, route, CSS class/token, translation key, env var,
   API path or DB column: `grep -rn` across `apps packages scripts docs .github` — no stale
   references, imports, tests or docs may remain.
3. For each **changed behaviour**: is there a test that would fail without the change?
   Run `pnpm check:tests-required`.
4. Safety nets not weakened: no removed assertions, `.skip`/`.only`, lowered thresholds,
   new `eslint-disable`/`@ts-expect-error`/`any`, empty catches, or guard exceptions without a reason.
5. Scope: every changed file is needed for the linked issue. Move anything else to a new issue.
6. Content: no invented trust facts, no personal names, no secrets/PII, Tamil + English parity.
7. Run `pnpm verify` and record the summary table in the PR.

Report: a checklist of the above with ✔/✖ and evidence, then the list of fixes made.
