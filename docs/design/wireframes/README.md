# Wireframes

Low-fidelity layouts: **structure only** — section order, content blocks and states. They are greyscale
on purpose; colours, fonts and imagery come from the design tokens (`docs/design/tokens.md`) when
the real components are built.

| Wireframe                       | Issue | Screenshots                                                                                  |
| ------------------------------- | ----- | -------------------------------------------------------------------------------------------- |
| Single page (`/`, `/ta/`)       | #6    | [mobile 390px](screenshots/landing-390.png) · [desktop 1440px](screenshots/landing-1440.png) |
| Donate panel and payment states | #7    | —                                                                                            |
| Get Help panel                  | #8    | —                                                                                            |
| Owner dashboard                 | #9    | —                                                                                            |

Open the `.html` files in a browser to see them responsive at any width.
Regenerate screenshots: `pnpm wireframes` (cloud sandbox: prefix `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`).
The script fails if a wireframe overflows horizontally at 390px or 1440px.

## Legend

- `[Square brackets]` — placeholder or unverified content (issue #1). Never shipped as-is.
- Dashed box — unknown fact; on the real site it is **not shown at all**.
- Striped box — image slot (approved real photo, or a typographic alternative).
- Monospace notes — behaviour for the engineer; not visible on the site.

## Single page — section summary (#6)

| #   | Section              | Mobile (390)               | Desktop (1440)                                    | Empty / unknown state                                                |
| --- | -------------------- | -------------------------- | ------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | Header               | Logo, **Donate**, Menu     | Logo, 5 anchors, தமிழ் / EN, Get Help, **Donate** | Trust name placeholder until #1                                      |
| 2   | Hero                 | Text, buttons, then image  | Text left, image right                            | Typographic hero if no approved photo                                |
| 3   | About + facts strip  | Facts in 2 columns         | Facts in 1 row                                    | Unknown facts hidden; strip shrinks                                  |
| 4   | Ways we help         | Stacked cards              | Bento: 1 large + 5 cards                          | Category list is a draft until #1                                    |
| 5   | How a donation helps | Stacked                    | 3 columns                                         | Whole section hidden unless costs are verified                       |
| 6   | How it works         | 4 stacked steps            | 4 steps in a row                                  | —                                                                    |
| 7   | Impact & stories     | Stacked states             | Two states side by side (for review)              | **State B** (launch default): factual activity statement, no numbers |
| 8   | Transparency         | List with Download         | Same, wider                                       | "Documents will be published here."                                  |
| 9   | FAQ                  | Accordion                  | Accordion                                         | —                                                                    |
| 10  | Contact              | Details, then Get Help box | Two columns                                       | Full address pending; shows "Kanchipuram, Tamil Nadu"                |
| 11  | Final CTA            | Amount chips + Donate      | Same                                              | —                                                                    |
| 12  | Footer               | 2 columns                  | 4 columns                                         | Legal particulars hidden until verified                              |

Confirmed facts used: phone and WhatsApp +91 96005 16999, info.theonetrust@gmail.com,
Kanchipuram, Tamil Nadu, calls every day 8 AM – 10 PM. Headline and CTA lines are drafts from the
UX brief, marked as such.

## Animation plan (#6)

Subtle and purposeful — never decorative motion that delays reading or donating.

| Where                      | Motion                                                         | Timing token                         | Reduced motion                 |
| -------------------------- | -------------------------------------------------------------- | ------------------------------------ | ------------------------------ |
| Section headings and cards | Fade + 12px rise when 15% visible, once per page load          | `--duration-slow`, `--ease-standard` | Appear instantly               |
| Bento and step cards       | Same, staggered 60ms (max 6 items)                             | `--duration-slow`                    | Instantly, no stagger          |
| Buttons, links, cards      | Hover/press colour change; cards lift with `--shadow-md`       | `--duration-fast`                    | Colour change only             |
| Focus                      | Focus ring appears immediately (never animated)                | —                                    | Same                           |
| Impact numbers             | Count-up from 0 **only for verified, published figures**, once | 800ms max                            | Final number shown immediately |
| Panels (donate, get help)  | Slide in from the side (desktop) / bottom (mobile)             | `--duration-base`                    | Appear instantly               |
| Language switch            | Text cross-fade; layout does not jump                          | `--duration-fast`                    | Instant swap                   |
| Sticky header              | Gains a hairline shadow after scrolling 8px                    | `--duration-fast`                    | Same without transition        |

Rules: no parallax, no auto-playing carousels or video, no scroll-jacking. Nothing animates that
the visitor must wait for before acting. All motion respects `prefers-reduced-motion`
(already enforced by tokens and global CSS).

## Review checklist for the owner

- [ ] Section order matches what you want people to see first.
- [ ] Nothing important is missing from the hero, header or footer.
- [ ] "Ways we help" categories — confirm or edit the list.
- [ ] Impact: launch with State B (no numbers) until verified figures exist — OK?
- [ ] Final CTA amounts ₹500 / ₹1,000 / ₹2,000 / ₹5,000 + Other — OK?
