#!/usr/bin/env node
/**
 * Checks and renders the low-fidelity wireframes in docs/design/wireframes/*.html.
 *
 * For English and Tamil (?lang=ta) at 360, 390, 768, 1366 and 1440px it FAILS if:
 *   - the page is wider than the screen (horizontal overflow), or
 *   - the header wraps (any header control taller than one line, or the header row too tall).
 * Then it saves full-page screenshots at 390px and 1440px for both languages.
 *
 *   pnpm wireframes
 *   (cloud sandbox: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers pnpm wireframes)
 */
import { readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Playwright is a dev dependency of apps/web; resolve it from there.
const root = resolve(import.meta.dirname, '..');
const { chromium } = createRequire(join(root, 'apps/web/package.json'))('@playwright/test');

const dir = join(root, 'docs/design/wireframes');
const out = join(dir, 'screenshots');
const widths = [360, 390, 768, 1366, 1440];
const screenshotWidths = new Set([390, 1440]);
const languages = ['en', 'ta'];
const MAX_HEADER_ROW = 72; // px: one row of 44-48px controls plus padding
const MAX_CONTROL = 56; // px: a header button/link taller than this has wrapped

const problems = [];
const browser = await chromium.launch();
try {
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.html'))) {
    for (const lang of languages) {
      for (const width of widths) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        const url = pathToFileURL(join(dir, file));
        if (lang !== 'en') url.searchParams.set('lang', lang);
        await page.goto(url.href);

        // Runs in the browser; globalThis keeps Node-side linting happy.
        const result = await page.evaluate(
          ({ maxRow, maxControl }) => {
            const doc = globalThis.document;
            const rootEl = doc.documentElement;
            const issues = [];
            if (rootEl.scrollWidth > rootEl.clientWidth) {
              issues.push(
                `page is ${rootEl.scrollWidth}px wide in a ${rootEl.clientWidth}px screen`,
              );
            }
            const row = doc.querySelector('header .wrap');
            if (row && row.getBoundingClientRect().height > maxRow) {
              issues.push(
                `header row is ${Math.round(row.getBoundingClientRect().height)}px tall (wrapped)`,
              );
            }
            // Count the real lines of TEXT in an element (ignores icons/boxes and hidden parts).
            const textLines = (el) => {
              const walker = doc.createTreeWalker(el, 4 /* NodeFilter.SHOW_TEXT */);
              const tops = [];
              for (let node = walker.nextNode(); node; node = walker.nextNode()) {
                if (!node.textContent.trim()) continue;
                const range = doc.createRange();
                range.selectNodeContents(node);
                for (const r of range.getClientRects()) if (r.width > 0) tops.push(r.top);
              }
              const lineHeight = parseFloat(globalThis.getComputedStyle(el).fontSize) * 0.9;
              return tops
                .sort((a, b) => a - b)
                .filter((top, i, all) => i === 0 || top - all[i - 1] > lineHeight).length;
            };
            for (const el of doc.querySelectorAll('header .wrap > *:not(nav), header nav a')) {
              const box = el.getBoundingClientRect();
              if (box.width === 0) continue; // hidden at this width
              const lines = textLines(el);
              if (lines > 1 || box.height > maxControl) {
                issues.push(
                  `header item "${el.textContent.trim().slice(0, 24)}" wraps (${lines} lines, ${Math.round(box.height)}px)`,
                );
              }
              if (box.right > rootEl.clientWidth + 1) {
                issues.push(`header item "${el.textContent.trim().slice(0, 24)}" is cut off`);
              }
            }
            // Every button, amount chip and toggle: one line, and its text fits inside it
            // (panels clip overflow, so a too-long label would be silently cut off).
            for (const el of doc.querySelectorAll('.btn, .chip, .seg span')) {
              const box = el.getBoundingClientRect();
              if (box.width === 0) continue;
              const label = el.textContent.trim().slice(0, 28);
              // Full-width buttons may use two lines for long Tamil labels; everything else one.
              const maxLines = el.classList.contains('block') ? 2 : 1;
              const lines = textLines(el);
              if (lines > maxLines)
                issues.push(`control "${label}" wraps (${lines} lines, max ${maxLines})`);
              if (el.scrollWidth > el.clientWidth + 1) {
                issues.push(
                  `control "${label}" text is cut off (${el.scrollWidth} > ${el.clientWidth})`,
                );
              }
              // Any ancestor that clips (overflow not visible) must fully contain the control —
              // a squeezed toggle clipped by its own container is as broken as one cut by the panel.
              for (let up = el.parentElement; up && up !== doc.body; up = up.parentElement) {
                if (globalThis.getComputedStyle(up).overflowX === 'visible') continue;
                const r = up.getBoundingClientRect();
                if (box.left < r.left - 1 || box.right > r.right + 1) {
                  issues.push(`control "${label}" is clipped by its container`);
                  break;
                }
              }
            }
            // Tamil parity: every translatable element must have a Tamil entry
            // (`ta` is the page's top-level dictionary).
            if (rootEl.lang === 'ta') {
              const dict = typeof ta === 'object' ? ta : {}; // eslint-disable-line no-undef
              const missing = new Set();
              for (const el of doc.querySelectorAll('[data-i18n]')) {
                if (!dict[el.dataset.i18n]) missing.add(el.dataset.i18n);
              }
              if (missing.size) issues.push(`no Tamil text for: ${[...missing].join(', ')}`);
            }
            return issues;
          },
          { maxRow: MAX_HEADER_ROW, maxControl: MAX_CONTROL },
        );
        for (const issue of result) problems.push(`${file} [${lang} @ ${width}px] ${issue}`);

        if (screenshotWidths.has(width)) {
          const suffix = lang === 'en' ? '' : `-${lang}`;
          const target = join(out, `${basename(file, '.html')}-${width}${suffix}.png`);
          await page.screenshot({ path: target, fullPage: true });
          console.log(`✔ ${target}`);
        }
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
}

if (problems.length) {
  console.error(`\n✖ ${problems.length} wireframe problem(s):\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(
  `\n✔ No overflow, header wrapping, broken or clipped controls or missing Tamil text in ${languages.length} languages × ${widths.length} widths`,
);
