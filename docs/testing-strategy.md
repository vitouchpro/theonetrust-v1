# Testing strategy and harness

Goal: every change arrives with automated proof that the success path works, failure paths fail
safely and edge cases are handled — and bugs are detected even when nobody wrote a test for them.

## Layers

| Layer         | Tool                                                                                          | Where                        | Runs                   |
| ------------- | --------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------- |
| Static        | Prettier, ESLint (strict TS, React hooks, jsx-a11y strict, server-import ban), `tsc --strict` | everywhere                   | pre-merge              |
| Unit          | Vitest (+ Testing Library, axe-core in jsdom)                                                 | `src/**/*.test.ts(x)`        | every save / pre-merge |
| API           | Vitest + Fastify `app.inject()`                                                               | `apps/api/src/**/*.test.ts`  | pre-merge              |
| E2E           | Playwright, 5 viewports (360, 390, 768, 1366, 1440)                                           | `apps/web/e2e/`              | pre-merge              |
| Scripts/hooks | `node:test`                                                                                   | `scripts/`, `.claude/hooks/` | pre-merge              |

## Auto bug detectors (no test needs to ask for them)

**Unit** (`apps/web/src/test/setup.ts`): any `console.error`/`console.warn` during a test fails it
(React key warnings, `act()` warnings, invalid DOM nesting…). Allow-list per test only with
`consoleGuard.allow(/specific/)`.

**E2E** (`apps/web/e2e/fixtures/guard.ts`, auto fixture on every test): fails on console
errors/warnings, uncaught exceptions, failed requests and same-origin 4xx/5xx, horizontal overflow
(names the offending elements), axe WCAG 2.2 AA violations (incl. colour contrast in a real
browser), missing `lang`/`title`/`<main>`, ≠ 1 `<h1>`, duplicate ids, unnamed links.
`guard.self-test.spec.ts` plants each bug type to prove the detector still catches it.

**Crawler** (`crawl.spec.ts`): visits every internal link from `/` — new pages are covered automatically.

**Coverage thresholds**: contracts 100%; web and API ≥ 90% lines/functions/statements, ≥ 85% branches.
Vitest `requireAssertions` fails tests that assert nothing.

## Gates that force tests to be written

- **tests-required** (`scripts/check-tests-required.mjs`): a package whose `src` changed must also
  change a test in the same package. Bypass only with `Tests-Not-Needed: <reason>` in the PR body.
- **Claude Code hooks** (`.claude/settings.json`):
  - _PostToolUse_ — blocks edits containing secrets/PAN or conflict markers; reminds to write tests
    when production source changes.
  - _Stop_ — runs `pnpm verify:quick` before Claude finishes; on failure Claude must fix it.
- **CI** (`.github/workflows/ci.yml`): format → lint → typecheck → script tests → unit + coverage →
  tests-required → diff check → build → bundle secret scan → Playwright (5 viewports) with
  `failOnFlakyTests`. Reports and traces are uploaded on failure.

## How an engineer (or Claude) works an issue

1. `implementation-task` skill → plan + `edge-case-matrix` (success / failure / edge rows).
2. Tests first (or `test-engineer` agent), see them fail, implement, `pnpm verify`.
3. `change-audit` skill + reviewer agents (`change-auditor`, `payment-security-reviewer`,
   `ui-a11y-reviewer`) → fix Critical/High.
4. PR with the template: matrix, real command output, screenshots, risks.

## Planned additions (tracked in issues)

Visual regression baselines and Tamil/English screenshot matrix (#37), Lighthouse budgets (#16),
API integration tests against a real PostgreSQL in CI (#18), Razorpay sandbox payment matrix (#28),
security scanning (#38).
