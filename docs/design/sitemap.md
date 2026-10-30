# Sitemap and information architecture

Sources: `docs/website-plan.md` §1, §4, §14; `docs/ux-design-brief.md` §5; ADR 0004 (Tamil URLs).
Shape: **one long bilingual landing page** plus focused utility pages. Nothing here states facts
about the trust; content comes from issue #1 when verified.

## Routes

`apps/web/src/app/sitemap.test.ts` fails if the app defines a route that is not in this table.
Status: **Built** = exists in `apps/web/src/app/routes.tsx` · **Planned** = built by the issue shown.

<!-- prettier-ignore-start -->
| Route | Tamil route | Purpose | Who | Access | Search engines | Built in | Status |
|---|---|---|---|---|---|---|---|
| `/` | `/ta/` | Landing page: hero, about, ways we help, impact, transparency, FAQ, contact | Everyone | Public | Index | #11, #12, #13 | Built (placeholder) |
| `/donate` | `/ta/donate` | Donation flow: need → amount → details → Razorpay checkout; one-time or monthly | Donors | Public | Index | #24, #32 | Planned |
| `/donate/status/:token` | `/ta/donate/status/:token` | Result after checkout: verified success (acknowledgement link if above threshold), "pending verification" with safe re-check, failed, cancelled | Donor who just paid | Private random token (not the donation reference, which may appear on bank statements); donor-safe fields only | No index | #24, #26 | Planned |
| `/receipt/:token` | `/ta/receipt/:token` | Public donation acknowledgement (minimal fields) + PDF download + verification QR target | Donor and anyone they share it with | Unguessable token | No index | #29 | Planned |
| `/manage/:token` | `/ta/manage/:token` | See and cancel monthly giving without logging in; pause only where Razorpay supports it for that method (UPI mandates are paused in the donor's UPI app) | Monthly donor | Private random token | No index | #32, #33 | Planned |
| `/help` | `/ta/help` | Get Help wizard (for self / someone else) and one-field Call me back | People who need help, and helpers | Public | Index | #15, #22 | Planned |
| `/privacy` | `/ta/privacy` | Privacy policy | Everyone | Public | Index | #14 | Planned |
| `/terms` | `/ta/terms` | Terms of use | Everyone | Public | Index | #14 | Planned |
| `/refund-policy` | `/ta/refund-policy` | Refund, cancellation and correction policy | Donors | Public | Index | #14 | Planned |
| `/admin/login` | — | Owner sign-in with authenticator-app second factor | Trust owner | Public page, rate-limited | No index | #19 | Planned |
| `/admin` | — | Overview: verified totals, pending, failed, refunds, recent activity, exceptions | Trust owner | Owner session | No index | #31 | Planned |
| `/admin/donations` | — | Donations ledger with filters and CSV export | Trust owner | Owner session | No index | #31 | Planned |
| `/admin/donations/:id` | — | One donation: payment attempts, webhook history, receipt, notifications | Trust owner | Owner session | No index | #31 | Planned |
| `/admin/exceptions` | — | Payment exceptions and reconciliation (pending too long, mismatch, bank transfers) | Trust owner | Owner session | No index | #25, #31 | Planned |
| `/admin/receipts` | — | Receipts: copy link, download, resend | Trust owner | Owner session | No index | #31 | Planned |
| `/admin/help-requests` | — | Help request inbox: New → Contacted → Verifying → Helping → Closed | Trust owner | Owner session | No index | #22 | Planned |
| `/admin/help-requests/:id` | — | One help request with private notes and status history | Trust owner | Owner session | No index | #22 | Planned |
| `/admin/monthly-giving` | — | Monthly giving subscriptions and their charge history | Trust owner | Owner session | No index | #33 | Planned |
| `/admin/programmes` | — | Ways we help: create, edit, pause (bilingual) | Trust owner | Owner session | No index | #36 | Planned |
| `/admin/content` | — | Site sections, FAQ, impact metrics, stories (draft → preview → publish) | Trust owner | Owner session | No index | #36 | Planned |
| `/admin/transparency` | — | Transparency documents upload and publishing | Trust owner | Owner session | No index | #36 | Planned |
| `/admin/tax` | — | Tax & compliance: approval details, Form 113 export, 31 May reminder | Trust owner | Owner session | No index | #34, #35 | Planned |
| `/admin/settings` | — | Trust profile, receipt threshold, owner email, fee table, payment config status | Trust owner | Owner session | No index | #36 | Planned |
| `/admin/audit-log` | — | Append-only audit log | Trust owner | Owner session | No index | #20 | Planned |
| `*` | `/ta/*` | Not found page with a link home | Everyone | Public | No index | #2 | Built |
<!-- prettier-ignore-end -->

### URL rules

- **No personal data in URLs**, ever: no name, phone, email, PAN or address. Receipts and manage
  links use random tokens; the server stores only their hash.
- `/donate` accepts only safe pre-fill parameters: `?programme=<slug>&amount=<whole rupees>&frequency=monthly`.
  Unknown or invalid values are ignored, never trusted — the server validates everything again.
- Landing-page anchors use the same English IDs in both languages, so `/ta/#transparency` works.
- Old or mistyped paths show the not-found page; utility pages never redirect to the home page silently.

## Landing page (`/` and `/ta/`)

Section order follows the plan (§4). IDs are the anchor targets used by the navigation.

| #   | Section                                 | Anchor ID            | In nav?          | Notes                                                                               |
| --- | --------------------------------------- | -------------------- | ---------------- | ----------------------------------------------------------------------------------- |
| 1   | Header                                  | —                    | —                | Logo + trust name, nav, தமிழ் / English switch, **Get Help** and **Donate** buttons |
| 2   | Hero                                    | `top`                | —                | Human headline, short real scope, Donate (primary) + Get Help (secondary)           |
| 3   | About: introduction + trust facts strip | `about`              | **About**        | Only verified facts (issue #1); unknown fields hidden                               |
| 4   | Ways we help                            | `ways-we-help`       | **Ways we help** | Cards pass `programme` to `/donate`; general vs earmarked stated                    |
| 5   | How a donation helps                    | `how-donations-help` | —                | Illustrative only when costs are verified                                           |
| 6   | How it works                            | `how-it-works`       | —                | Need → amount → pay → acknowledgement and updates                                   |
| 7   | Impact and stories                      | `impact`             | **Impact**       | Sourced, dated metrics; consented stories; factual empty state, never zeros         |
| 8   | Transparency centre                     | `transparency`       | **Transparency** | Dated documents with language, period, file type                                    |
| 9   | FAQ                                     | `faq`                | —                | Includes payment limits, tax honesty, how to stop monthly giving                    |
| 10  | Contact                                 | `contact`            | **Contact**      | Phone, WhatsApp, email, area, call hours                                            |
| 11  | Footer                                  | —                    | —                | Legal name and particulars, policies, receipt help, transparency, language switch   |

## Navigation

**Desktop (≥ 64em)** — one row: logo + name · About · Ways we help · Impact · Transparency · Contact ·
தமிழ் / English · **Get Help** (secondary button) · **Donate** (gold primary button).
The header is sticky; the current section is marked with `aria-current="location"`.

**Tablet and mobile (< 64em)** — logo + name · **Donate** (always visible) · menu button
(accessible name "Menu" / "பட்டியல்"). The menu holds the five anchors, **Get Help** and the language
switch, opens as a sheet below the header (not full-screen), traps focus, and closes on Escape,
outside click or link choice. Get Help is also in the hero, so it is never more than one tap away.

**Footer** — four groups:

1. Trust: legal name, short mission, registration particulars (verified only).
2. Explore: About, Ways we help, Impact, Transparency, FAQ.
3. Help: Get Help, Contact, receipt help, refund & correction policy.
4. Legal: Privacy, Terms, language switch, © year.

Social links only if the trust confirms accounts it maintains.

## Search engines

- Indexed: `/`, `/donate`, `/help`, `/privacy`, `/terms`, `/refund-policy` and their `/ta/` mirrors.
- `noindex` + excluded from `sitemap.xml`: status, receipt, manage, admin, not-found pages.
- `hreflang` alternates `en-IN`, `ta-IN`, `x-default` (English) on every indexed page (issue #16).

## Contact facts confirmed so far (issue #1)

Website theonetrust.in · email info.theonetrust@gmail.com · phone and WhatsApp +91 96005 16999 ·
Kanchipuram, Tamil Nadu · calls Mon–Sat 8 AM – 10 PM. Postal address: pending from the client.

## Open questions for the owner

1. **Dashboard language**: English only at launch, or should the owner dashboard also offer Tamil?
2. **Sunday**: closed for calls (assumed), or a different time?

## Deferred to a later phase (from the UX brief)

Separate pages for About / Mission & Vision, Welfare activity detail, Projects and project detail,
Impact & achievements, News & updates, Gallery. When added they follow the same rules: English at the
root, Tamil under `/ta/`, verified content only, listed in this table first.
