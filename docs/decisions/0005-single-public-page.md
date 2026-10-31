# ADR 0005 — One public page; donating and getting help happen in panels

- **Date**: 2026-10-31
- **Status**: Accepted (owner approved)
- **Issues**: #5, #11, #12, #13, #15, #24

## Decision

- Public visitors and donors use **one single page**: `/` (English) and `/ta/` (Tamil, ADR 0004).
- **Donate** and **Get Help** open as panels (accessible dialogs) on that page, including the
  payment result. There are no separate `/donate`, `/donate/status/…` or `/help` pages.
- The only other public pages are the policy pages Razorpay requires before activating live
  payments: `/terms`, `/privacy`, `/refund-policy` (the refund page also states that shipping does
  not apply to donations).
- Private links sent by email stay as routes: `/receipt/:token` and `/manage/:token`.
- The owner dashboard lives at `/admin/*`, in Tamil or English with a toggle saved to the owner's
  account (not a `/ta/` URL).

## Why

- The owner wants one simple page for the public; nobody should get lost moving between pages.
- Razorpay checks the website's policy pages during activation, so those must exist as real links.
- Receipt and manage links arrive by email and must open directly, so they need their own routes.

## Consequences

- Pre-fill and deep links use the page itself: `/ta/?programme=education#donate`, `/#get-help`.
- The payment result is never put in the URL. A private status token is kept only in the browser
  tab while a payment is being confirmed, so a refresh re-checks safely.
- Issue #24 builds a donate **panel**, issue #15 a Get Help **panel** (not pages).
- `sitemap.test.ts` fails if a public browsing page other than the single page and the policy pages
  is added. Adding more pages later requires a new decision.
