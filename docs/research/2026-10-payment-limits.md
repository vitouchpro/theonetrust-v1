# Research: UPI limits, ₹2,000 rules and autopay (30 Oct 2026)

Checked on 30 Oct 2026. Provider limits change — re-verify against Razorpay's dashboard and docs
when implementing issues #23–#25 and #32–#33. Not legal or tax advice.

## Findings

| Topic                          | Finding                                                                                                                                                                                          | Product impact                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Tax: cash limit                | Income-tax Act 2025 s.133(5): deduction for a donation over ₹2,000 only if paid by a mode other than cash.                                                                                       | UPI/QR/card/netbanking are non-cash ⇒ eligible. Site is online-only. FAQ explains it (#13).                                    |
| UPI MDR                        | From 15 Oct 2026, 0.4% MDR on eligible P2M UPI payments above ₹2,000, capped at ₹300 for ≥ ₹75,000; small P2PM merchants (≤ ₹1 lakh/month QR receipts) exempt; consumers don't pay it.           | Fee estimate for "cover the fee" uses a configurable table, never hard-coded (#23).                                            |
| UPI per-transaction limit      | Standard ₹1 lakh per transaction (higher only for specific categories). Banks can set lower limits; RRBs often ₹5,000–₹25,000. New UPI users: ₹5,000 in first 24 h. UPI Lite ₹1,000 per payment. | Donate page explains limits and offers card/netbanking/bank transfer when hit (#24). Bank transfer path for large gifts (#25). |
| UPI AutoPay                    | ₹15,000 per debit without additional authentication; ₹1 lakh only for specific categories (credit card bills, insurance, mutual funds). Razorpay default UPI AutoPay mandate max ₹15,000.        | Monthly UPI giving capped at ₹15,000; larger monthly gifts via eMandate or card (#32).                                         |
| Razorpay Subscriptions methods | Cards, UPI AutoPay and eMandate (eNACH); eMandate max ₹1,00,00,000.                                                                                                                              | Method routing by amount (#32).                                                                                                |
| PSP support                    | Mandates > ₹15,000 supported on Google Pay, Paytm, Amazon Pay; not PhonePe or BHIM.                                                                                                              | Warning on consent screen (#32).                                                                                               |
| QR for autopay                 | QR supported on Standard Checkout for recurring payments.                                                                                                                                        | Donor can scan to set up monthly giving.                                                                                       |
| Mandate control                | Donors can pause/cancel in their UPI app; merchant cannot modify or pause UPI mandates; 24 h pre-debit notice; don't schedule on last day of cycle.                                              | Webhook-driven status, cancel+recreate for amount change, schedule rule (#33).                                                 |

## Sources

- Income Tax Department — Section 133, Income-tax Act 2025: https://www.incometaxindia.gov.in/w/section-133-94
- PayU — UPI MDR 2026: https://payu.in/blog/upi-mdr-2026-what-the-new-charge-means-for-businesses/
- Equentis — UPI rules 2026: https://www.equentis.com/blog/upi-transaction-new-rules-2026-complete-guide-for-users-and-merchants/
- Razorpay — UPI limit per day: https://razorpay.com/blog/upi-transaction-limit-per-day/
- StartupFlora — UPI limits 2026: https://startupflora.com/post/upi-transaction-limit
- Zoho Payments — UPI AutoPay mandates: https://www.zoho.com/payments/academy/payment-processing/upi-autopay-mandates-and-recurring-debits.html
- Razorpay — Subscriptions supported banks/apps: https://razorpay.com/docs/payments/subscriptions/supported-banks-apps.md
- Razorpay — Subscriptions payment methods: https://razorpay.com/docs/payments/subscriptions/supported-payment-methods.md
- Razorpay — UPI recurring FAQs: https://razorpay.com/docs/payments/recurring-payments/upi/faqs.md
