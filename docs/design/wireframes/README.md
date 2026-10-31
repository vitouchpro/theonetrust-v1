# Wireframes

Low-fidelity layouts: **structure only** — section order, content blocks and states. They are greyscale
on purpose; colours, fonts and imagery come from the design tokens (`docs/design/tokens.md`) when
the real components are built.

| Wireframe                           | Issue | Screenshots (English · Tamil)                                                                                                                                                   |
| ----------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Single page (`/`, `/ta/`)           | #6    | mobile 390: [EN](screenshots/landing-390.png) · [TA](screenshots/landing-390-ta.png) — desktop 1440: [EN](screenshots/landing-1440.png) · [TA](screenshots/landing-1440-ta.png) |
| Donate panel and payment states     | #7    | mobile: [EN](screenshots/donate-390.png) · [TA](screenshots/donate-390-ta.png) — desktop: [EN](screenshots/donate-1440.png) · [TA](screenshots/donate-1440-ta.png)              |
| Monthly giving manage link          | #7    | mobile: [EN](screenshots/manage-390.png) · [TA](screenshots/manage-390-ta.png) — desktop: [EN](screenshots/manage-1440.png) · [TA](screenshots/manage-1440-ta.png)              |
| Donation acknowledgement page + PDF | #7    | mobile: [EN](screenshots/receipt-390.png) · [TA](screenshots/receipt-390-ta.png) — desktop: [EN](screenshots/receipt-1440.png) · [TA](screenshots/receipt-1440-ta.png)          |
| Get Help panel                      | #8    | mobile: [EN](screenshots/help-390.png) · [TA](screenshots/help-390-ta.png) — desktop: [EN](screenshots/help-1440.png) · [TA](screenshots/help-1440-ta.png)                      |
| Owner dashboard shell + overview    | #9    | mobile: [EN](screenshots/admin-390.png) · [TA](screenshots/admin-390-ta.png) — desktop: [EN](screenshots/admin-1440.png) · [TA](screenshots/admin-1440-ta.png)                  |

Open the `.html` file in a browser; add `?lang=ta` for Tamil. Interface text is translated (draft
wording, to be reviewed by the trust) so **real Tamil lengths are tested**; placeholders and engineer
notes stay in English.

## Automatic checks

`pnpm wireframes` (cloud sandbox: prefix `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`) checks
**English and Tamil at 360, 390, 768, 1366 and 1440px** and fails if:

- the page is wider than the screen, or
- any header item wraps onto a second line (counted from the real text lines) or is cut off;
- any button, amount chip or toggle wraps (full-width buttons may use 2 lines for long Tamil
  labels), has its text cut off, or is clipped by its panel or any container around it;
- (Tamil) any translatable text has no Tamil entry.

It then saves the full-page screenshots above. It was proven against the first draft, where it
caught the Tamil header wrapping at 1366px and being cut off at 390px. The container-clipping and
Tamil-text checks were added in #9 after a squeezed language toggle and an untranslated title slipped
past the earlier version; both were proven by planting the bug again.

## Donate panel, manage link and acknowledgement (#7)

The donate panel opens on the single page (`#donate`): a full-height sheet on phones, a 480px side
panel on desktop. `donate.html` shows every screen as a gallery, in the donor's order:

| State | Screen                           | Key rules                                                                                                                                                                         |
| ----- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A     | Step 1 — choose a need           | "Where it's needed most" pre-selected; same categories as the page                                                                                                                |
| B     | Step 2 — amount                  | Once/Monthly; ₹500/₹1,000/₹2,000/₹5,000/Other; any amount from ₹1; optional cover-fee (from the owner's fee table); ways-to-pay guidance (UPI up to ₹1 lakh, bank may allow less) |
| C     | Step 3 — details (with an error) | Name + mobile required, email optional; acknowledgement offered from ₹500; "don't show my name"; tax option hidden until approval                                                 |
| D     | Step 4 — review and pay          | Summary, trust line, link to bank transfer for large gifts                                                                                                                        |
| E     | Processing                       | No close button, no double payment, announced to screen readers                                                                                                                   |
| F     | Success                          | **Only after server verification**; acknowledgement download/share only above the threshold and on request                                                                        |
| G     | Pending verification             | "Please don't pay again" + Check again + contact with reference                                                                                                                   |
| H     | Failed                           | Try again / other ways to pay; details kept                                                                                                                                       |
| I     | Cancelled                        | Back to review, nothing charged, choices kept                                                                                                                                     |
| J     | UPI limit reached                | Card/netbanking, bank transfer or a smaller UPI amount; new-user ₹5,000 note                                                                                                      |
| K     | Bank transfer                    | Amount, account, IFSC, reference; "not confirmed yet"; UTR optional and never proof of payment                                                                                    |
| L     | Monthly consent                  | ₹15,000 UPI AutoPay limit, 24-hour bank notice, how to cancel, PhonePe/BHIM note, explicit agreement                                                                              |
| M     | Monthly active                   | Only after the mandate is authorised and verified                                                                                                                                 |

`manage.html` (`/manage/:token`): active · confirm cancel · cancelled · paused in the UPI app ·
payments failing · invalid link (same message for wrong/expired; rate-limited).

`receipt.html` (`/receipt/:token`): public acknowledgement page with only acknowledgement number,
date, amount, purpose and donor name (only if not hidden) · invalid link · refunded/corrected ·
A4 PDF layout ("Donation acknowledgement — not Form 114", verification QR, template version).
No PAN, phone, email or address on the public page, ever. The PDF is generated in the donor's
language (English shown; Tamil uses the same layout).

**Senior UX self-review fixes**: visible "Step n / 4" text (not only bars); "Other help" added so
the panel matches the page; the bank-transfer screen shows the amount to transfer; the large-gift
line became a text link that can wrap; one long Tamil label no longer widens the panel
(`min-width: 0`), proven by the control check.

## Get Help panel (#8)

The Get Help panel opens on the single page (`#get-help`) in the same sheet / side panel as Donate.
It is written for people with low digital confidence: one question per screen, large tap targets,
plain words, and always a human alternative. `help.html` shows every screen in the person's order:

| State | Screen                           | Key rules                                                                                                                            |
| ----- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| A     | Start                            | Form (5 short steps) or quick contact: call me back, WhatsApp, phone; hours every day 8 AM – 10 PM; "asking does not guarantee help" |
| B     | Step 1 — who needs help          | Me / someone I know / on someone's behalf                                                                                            |
| C     | Step 2 — kind of help            | Icon + text tiles, more than one allowed, ✓ on selected; "I don't know how to explain" skips step 3; "life in danger → call 112"     |
| D     | Step 3 — description (optional)  | Tamil or English, 500 characters, skippable; **no documents, Aadhaar, medical or income proof**                                      |
| E     | Step 4 — contact (with an error) | Mobile/WhatsApp required; their name or village only when asking for someone else and only if they agree; call language; best time   |
| F     | Step 5 — consent and send        | Contact consent; third-party consent only when asking for someone else; privacy link                                                 |
| G     | Sent                             | Reference ID, "we will call you", urgent → phone/WhatsApp; owner notified, request appears as New (#22)                              |
| H     | Just call me back                | One field + consent                                                                                                                  |
| I     | Network error                    | Answers kept, try again, WhatsApp/phone                                                                                              |
| J     | Too many attempts                | Polite wait message, never blames the person, human channel offered                                                                  |

**Senior UX self-review fixes**: selected help tiles show a ✓ as well as a thick border (state never
shown by one cue alone, and several can be chosen); a "call 112 if a life is in danger" line, because
the form ends in a call back and is not for emergencies that cannot wait.

## Owner dashboard — shell and overview (#9)

`/admin` is owner-only (sign-in with a second factor comes in #23). It is functional and dense,
deliberately plainer than the public page, with the owner's Tamil/English toggle always visible.
`admin.html` shows the shell and every state of the Overview screen:

| State | Screen                     | Key rules                                                                                                                                                                                                                                                                                                                        |
| ----- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A     | Normal day                 | Side menu (Money · People · Website · System groups, counts as text); verified totals today / this month / since launch; Paid · Pending verification · Failed · Refunded counts; "how the total is worked out" (received − refunded = net); "this is not your bank balance"; Needs attention; Recent activity with masked donors |
| B     | No donations yet           | Totals show ₹0, never blank; "Check payment setup"                                                                                                                                                                                                                                                                               |
| C     | Loading                    | Grey placeholders, never ₹0 while loading                                                                                                                                                                                                                                                                                        |
| D     | Could not load             | No figures shown at all; Try again + error reference                                                                                                                                                                                                                                                                             |
| E     | Payment updates delayed    | Shown when the last Razorpay update or reconciliation is older than a setting; figures carry an "as of" time                                                                                                                                                                                                                     |
| F     | Menu open (phones/tablets) | Full-height list incl. Sign out; focus moves in and back; Esc closes                                                                                                                                                                                                                                                             |

Only server-verified captured payments count as received. Status always has an icon **and** a word,
never colour alone. Phones: menu button, short "Admin" title, language toggle; Sign out moves into the
menu. The detailed screens (donations, payment problems, help inbox, settings…) are separate issues.

**Senior UX self-review fixes**: phone header no longer squeezes the language toggle or cuts the
trust name; side-menu counts never wrap; activity rows on phones read description → amount →
status; Tamil title on phones was missing (caught by the new parity check).

## Legend

- `[Square brackets]` — placeholder or unverified content (issue #1). Never shipped as-is.
- Dashed box — unknown fact; on the real site it is **not shown at all**.
- Striped box — image slot (approved real photo, or a typographic alternative).
- Monospace notes — behaviour for the engineer; not visible on the site.

## Single page — section summary (#6)

| #   | Section                       | Mobile (390)                                           | Desktop (1440)                                                                 | Empty / unknown state                                                 |
| --- | ----------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| 1   | Header                        | Logo · **language switch** · **Donate** · menu icon    | Logo + name · 5 section links (from 1280px) · language · Get Help · **Donate** | Trust name placeholder until #1                                       |
| 1b  | Help strip                    | "Need help?" · call · WhatsApp · ask for help · hours  | Same, one row                                                                  | —                                                                     |
| 2   | Hero                          | Text, buttons, trust line, then image                  | Text left, image right                                                         | Typographic hero if no approved photo                                 |
| 3   | About + facts strip           | Facts in 2 columns                                     | Facts in 1 row                                                                 | Unknown facts hidden; strip shrinks (contact details live in Contact) |
| 4   | Ways we help                  | Stacked tappable cards                                 | Bento: large **"Where it's needed most"** (general) + 6 equal cards            | Category list is a draft until #1                                     |
| 5   | How a donation helps          | Stacked                                                | 3 columns                                                                      | Whole section hidden unless costs are verified                        |
| 6   | Impact & stories              | Stacked states                                         | Two states side by side (for review)                                           | **State B** (launch default): factual activity statement, no numbers  |
| 7   | Transparency                  | List with Download                                     | Same, wider                                                                    | "Documents will be published here."                                   |
| 8   | FAQ                           | Accordion                                              | Accordion                                                                      | —                                                                     |
| 9   | Contact + Get Help            | Details, then "Ask for help" with who-we-help scope    | Two columns                                                                    | Full address pending; shows "Kanchipuram, Tamil Nadu"                 |
| 10  | Final donate band             | Once/Monthly · amounts · Donate · trust line · 4 steps | Same                                                                           | —                                                                     |
| 11  | Footer                        | 2 columns                                              | 4 columns                                                                      | Legal particulars hidden until verified                               |
| —   | Floating WhatsApp/call button | Bottom-right, 56px                                     | Hidden (help strip + header cover it)                                          | —                                                                     |

**Header behaviour**: the section links sit in the header from 1280px; below that they are in the
menu, while **Donate**, **Get Help** (from 768px) and the **language switch** (all widths) stay
visible. On phones the trust name shows from 480px; below that, only the logo.

Confirmed facts used: phone and WhatsApp +91 96005 16999, info.theonetrust@gmail.com,
Kanchipuram, Tamil Nadu, calls every day 8 AM – 10 PM. Headline and CTA lines are drafts from the
UX brief, marked as such.

## Changes after the senior UX critique

| Finding                                               | Change                                                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Tamil header wrapped (1366px) and was cut off (390px) | Header redesign above; checked in both languages at 5 widths                                            |
| No language switch on the mobile header               | Visible switch on every width                                                                           |
| Help seekers buried                                   | Help strip under the header, floating WhatsApp/call button on mobile, Get Help in the header from 768px |
| Who can ask for help not explained                    | "Ask for help" block: for self or others, who the trust helps, callback, "does not guarantee help"      |
| No reassurance next to Donate                         | Trust line under both Donate buttons (Razorpay, methods, acknowledgement after verified payment)        |
| Large card suggested an unconfirmed priority          | Large card is now the general fund ("Where it's needed most")                                           |
| Page too long; repeated sections                      | "How it works" merged into the final donate band as 4 compact steps                                     |
| Monthly giving not offered in the band                | Once / Monthly choice before the amounts                                                                |
| Phone repeated in facts strip                         | Removed; strip only proves the trust is real                                                            |
| Small tap targets on card links                       | Whole card is one tap target                                                                            |

## Animation plan (#6)

Subtle and purposeful — never decorative motion that delays reading or donating.

| Where                      | Motion                                                         | Timing token                         | Reduced motion                 |
| -------------------------- | -------------------------------------------------------------- | ------------------------------------ | ------------------------------ |
| Section headings and cards | Fade + 12px rise when 15% visible, once per page load          | `--duration-slow`, `--ease-standard` | Appear instantly               |
| Bento cards                | Same, staggered 60ms (max 6 items)                             | `--duration-slow`                    | Instantly, no stagger          |
| Buttons, links, cards      | Hover/press colour change; cards lift with `--shadow-md`       | `--duration-fast`                    | Colour change only             |
| Focus                      | Focus ring appears immediately (never animated)                | —                                    | Same                           |
| Impact numbers             | Count-up from 0 **only for verified, published figures**, once | 800ms max                            | Final number shown immediately |
| Panels (donate, get help)  | Slide in from the side (desktop) / bottom (mobile)             | `--duration-base`                    | Appear instantly               |
| Language switch            | Text cross-fade; layout does not jump                          | `--duration-fast`                    | Instant swap                   |
| Sticky header              | Gains a hairline shadow after scrolling 8px                    | `--duration-fast`                    | Same without transition        |
| Floating WhatsApp button   | No motion (no bouncing or pulsing)                             | —                                    | Same                           |

Rules: no parallax, no auto-playing carousels or video, no scroll-jacking. Nothing animates that
the visitor must wait for before acting. All motion respects `prefers-reduced-motion`.

## Notes for the real build (#10, #11)

- Grid and flex items need `min-width: 0` (the first draft overflowed by 2px at 390px without it).
- Tamil section links are long: keep their font at least 14px in the real header, and keep the
  header text-line check from `render-wireframes.mjs` as a Playwright test.

## Review checklist for the owner

- [ ] Section order matches what you want people to see first.
- [ ] Help strip and floating WhatsApp button — OK?
- [ ] "Ways we help" categories — confirm or edit the list.
- [ ] Impact: launch with State B (no numbers) until verified figures exist — OK?
- [ ] Final band amounts ₹500 / ₹1,000 / ₹2,000 / ₹5,000 + Other, with Once / Monthly — OK?
