---
name: edge-case-matrix
description: Build the success / failure / edge-case test matrix for a feature before writing code. Use when planning tests for any issue, bug fix or review.
---

# Edge-case matrix

Write a table: `# | Category | Scenario | Input/State | Expected result | Test level (unit/API/e2e) | Test name`.
Cover every category that applies. Each acceptance criterion maps to at least one row.

## Categories to consider

**Success** — the main path; each variant (e.g. each payment method, each help type).

**Validation / boundaries** — empty, whitespace-only, min, min−1, max, max+1, decimals, negative,
huge numbers, leading zeros, Unicode/Tamil input, emoji, very long strings, HTML/script injection,
unknown fields (must be rejected).

**Failure** — network error, timeout, 4xx, 5xx, provider down, invalid signature, DB constraint
violation, email provider failure (must not undo a payment), partial failure mid-flow.

**Concurrency / repetition** — double click/submit, retry after failure, duplicate webhook,
out-of-order webhook, two tabs, refresh mid-flow, browser back/forward, stale session.

**Money** (any payment work) — ₹1, quick picks, custom amount, max limit, paise rounding,
amount/currency/order mismatch, cancelled checkout, pending → paid later, failed, refunded,
UPI bank limit hit, new-UPI-user limit, > ₹15,000 UPI AutoPay mandate, cancel from UPI app,
halted subscription, bank transfer with unmatched credit, UTR/screenshot must not mark paid.

**Security / privacy** — unauthenticated, wrong role, CSRF, rate limit, IDOR (other donor's
reference/token), PII in URL/log/response/public page, secrets in bundle, enumeration via errors.

**i18n** — Tamil and English both render, same meaning, language switch keeps state, long Tamil
strings don't clip, numbers/dates/currency formatted for en-IN/ta-IN, IST timezone boundaries
(midnight, 31 March / 1 April financial-year change).

**Accessibility** — keyboard only, focus order and visibility, screen-reader names and live
announcements, errors linked to fields, status not colour-only, reduced motion, 200% zoom.

**Layout** — 360, 390, 768, 1366, 1440 px; empty, loading, error and very-full states; slow images.

**Data states** — no data (empty state, never fake zeros), one item, many items (pagination),
unverified/unpublished content must stay hidden.

Every Playwright test imports from `./fixtures/guard.ts`, so console errors, exceptions, failed
requests, overflow and axe violations are caught automatically — don't re-implement those checks.
