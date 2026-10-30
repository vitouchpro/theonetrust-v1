# ADR 0002 — Owner dashboard data: TypeScript API over our own PostgreSQL ledger (no Python)

- **Date**: 2026-10-30
- **Status**: Accepted
- **Issues**: #18, #27, #31, #33, #35

## Question

Should the dashboard's Razorpay data (totals, pending, failed, refunds, trends) be produced by
Python queries/scripts, or another way?

## Decision

**The dashboard never queries Razorpay live and does not use Python.** Razorpay data flows into
our own PostgreSQL ledger, and the TypeScript API serves the dashboard from it.

```
Razorpay ──signed webhooks──▶ API (verify + idempotent write) ──▶ PostgreSQL ledger
   ▲                                                                   │
   └──── scheduled reconciliation job (Node, Razorpay API) ◀──────────┘
                                                                       ▼
                                   Admin API (Prisma + SQL aggregates) ──▶ React dashboard
```

1. **Source of truth = our ledger** (`donation_intents`, `payment_attempts`, `webhook_events`,
   `donation_subscriptions`, `receipts`, `bank_transfer_records`), written only by verified
   webhooks / server verification.
2. **Reconciliation job** (Node, same codebase) runs on a schedule: fetches recent orders,
   payments, refunds and settlements from the Razorpay API, compares with the ledger and raises
   exceptions (missing webhook, amount mismatch, unknown payment) into the admin exceptions queue.
   It never silently overwrites — differences become audited exceptions.
3. **Dashboard queries** are typed repository functions in the API: Prisma for lists/filters,
   parameterised SQL (`$queryRaw` with bound params) for aggregates — totals by day/month/
   financial year (IST), by programme, by method; gross vs refunds kept separate.
   Add PostgreSQL indexes (and materialised views later only if measurements demand it).
4. **Exports** (CSV, Form 113) are streamed from the same repositories with PII masking.

## Why not Python

- A second language/runtime doubles deployment, dependencies, secrets handling and tests for no gain;
  the team and harness are TypeScript.
- Shared contracts (`packages/contracts`) keep statuses and money rules identical in the API,
  dashboard and jobs — a Python layer would duplicate them and drift.
- Live provider queries from the dashboard would be slow, rate-limited, would spread API secrets,
  and couldn't show our own states (MANUAL_REVIEW, receipts, help cases).

Python (pandas/Jupyter) remains fine for **one-off, offline analysis on a CSV export** — never
connected to production secrets.

## Tests required

Aggregate queries tested against seeded synthetic data (sums in paise, IST day/FY boundaries,
refunds separate, pagination), reconciliation job tested with mocked Razorpay responses
(match, missing webhook, mismatch, duplicate), exports tested for masking.
