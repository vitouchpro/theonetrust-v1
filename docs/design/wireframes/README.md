# Wireframes

Low-fidelity layouts: **structure only** — section order, content blocks and states. They are greyscale
on purpose; colours, fonts and imagery come from the design tokens (`docs/design/tokens.md`) when
the real components are built.

| Wireframe                       | Issue | Screenshots (English · Tamil)                                                                                                                                                   |
| ------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Single page (`/`, `/ta/`)       | #6    | mobile 390: [EN](screenshots/landing-390.png) · [TA](screenshots/landing-390-ta.png) — desktop 1440: [EN](screenshots/landing-1440.png) · [TA](screenshots/landing-1440-ta.png) |
| Donate panel and payment states | #7    | —                                                                                                                                                                               |
| Get Help panel                  | #8    | —                                                                                                                                                                               |
| Owner dashboard                 | #9    | —                                                                                                                                                                               |

Open the `.html` file in a browser; add `?lang=ta` for Tamil. Interface text is translated (draft
wording, to be reviewed by the trust) so **real Tamil lengths are tested**; placeholders and engineer
notes stay in English.

## Automatic checks

`pnpm wireframes` (cloud sandbox: prefix `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`) checks
**English and Tamil at 360, 390, 768, 1366 and 1440px** and fails if:

- the page is wider than the screen, or
- any header item wraps onto a second line (counted from the real text lines) or is cut off.

It then saves the full-page screenshots above. It was proven against the first draft, where it
caught the Tamil header wrapping at 1366px and being cut off at 390px.

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
