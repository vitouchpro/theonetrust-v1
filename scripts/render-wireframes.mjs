#!/usr/bin/env node
/**
 * Renders the low-fidelity wireframes in docs/design/wireframes/*.html to PNG screenshots
 * at mobile (390px) and desktop (1440px) widths, so they can be reviewed on GitHub.
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
const widths = [390, 1440];

const browser = await chromium.launch();
try {
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.html'))) {
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(pathToFileURL(join(dir, file)).href);
      // Runs in the browser; globalThis keeps Node-side linting happy.
      const overflow = await page.evaluate(() => {
        const root = globalThis.document.documentElement;
        return root.scrollWidth > root.clientWidth;
      });
      if (overflow) throw new Error(`${file} overflows horizontally at ${width}px`);
      const target = join(out, `${basename(file, '.html')}-${width}.png`);
      await page.screenshot({ path: target, fullPage: true });
      console.log(`✔ ${target}`);
      await page.close();
    }
  }
} finally {
  await browser.close();
}
