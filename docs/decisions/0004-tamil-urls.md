# ADR 0004 — Tamil pages live under `/ta/`

- **Date**: 2026-10-31
- **Status**: Accepted (owner approved)
- **Issue**: #5

## Decision

- English pages are served at the root (`/`, `/terms`, …).
- Tamil pages mirror every public route under `/ta/` (`/ta/`, `/ta/terms`, …). The public site is a
  single page plus policy pages (ADR 0005).
- Anchor IDs on the landing page are the same in both languages (`/ta/#transparency`).
- The language switch moves to the same page in the other language and keeps the query string
  and any in-progress form state (e.g. chosen programme and amount).
- No automatic redirect based on browser language. A visitor who arrives at an English page from a
  Tamil-preferring browser may see a small, dismissible "தமிழில் படிக்க" suggestion.
- Each page declares `<html lang>` (`en` / `ta`), a canonical URL, and `hreflang` alternates
  (`en-IN`, `ta-IN`, `x-default` → English).
- The owner dashboard (`/admin/*`) is not mirrored under `/ta/`; it offers Tamil and English with a
  toggle saved to the owner's account (owner decision, 31 Oct 2026).

## Why

- A Tamil link shared in a WhatsApp family group opens in Tamil for everyone, not in whatever
  language each person last picked.
- Search engines can index and rank Tamil pages separately (`hreflang` needs distinct URLs).
- The URL itself is the language state, so refresh, back/forward and bookmarks behave predictably.

## Rejected alternative

One URL with a language toggle stored in the browser: simpler routing, but shared links open in
the wrong language, Google mostly sees English, and refresh can flip the language unexpectedly.

## Consequences

- The router has a `ta` prefix wrapper around the public route table (issue #11).
- `sitemap.xml` lists both language versions of every indexable page (issue #16).
- Tests: `apps/web/src/app/sitemap.test.ts` checks every public route has a documented `/ta/` mirror,
  and accepts app routes under `/ta/` when they match a documented Tamil route.
