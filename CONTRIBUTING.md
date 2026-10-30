# Contributing

1. **Pick the next issue** in milestone order whose "Depends on" issues are closed. Assign yourself.
2. **Branch** from up-to-date `main`: `feat/<issue>-<slug>` or `fix/<issue>-<slug>`.
3. **Plan + test matrix first** — follow `.claude/skills/implementation-task` and
   `.claude/skills/edge-case-matrix`. Every acceptance criterion maps to at least one test.
4. **Implement** the smallest coherent change. Use tokens/config, never hard-coded values.
   Tamil and English together. Never invent trust facts; no personal names.
5. **Verify**: `pnpm verify` must pass locally. Look at UI changes at 360 / 768 / 1440 px in both languages.
6. **Audit**: `.claude/skills/change-audit`, plus reviewer agents in Claude Code:
   `change-auditor` always, `payment-security-reviewer` for money/auth/PII, `ui-a11y-reviewer` for UI.
7. **Pull request** with the template filled in: matrix, real `pnpm verify` output, screenshots,
   risks, rollback, `Closes #<issue>`. CI must be green; one approving review required.

## Bugs

Every bug fix starts with a test that fails before the fix and passes after it.

## Never

Skip/weaken tests, lower coverage thresholds, add auto-bug-detector exceptions without a reason,
commit secrets or `.env`, touch production data or provider dashboards without owner approval.
