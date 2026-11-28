#!/usr/bin/env node
/**
 * Builds the link-preview (Open Graph) images, one per language, 1200 × 630 PNG.
 * WhatsApp, Facebook and X show this picture when someone shares the site.
 *
 *   pnpm --filter @theonetrust/web og:image
 *
 * Rendered with Playwright's Chromium so Tamil is shaped correctly, using the site's own fonts,
 * emblem and colour tokens. The words are the approved hero headline (content/landing.ts) and the
 * confirmed area (config/trust-facts.ts) — nothing new is claimed. Re-run after changing either.
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from '@playwright/test';

const webRoot = resolve(import.meta.dirname, '..');
const outDir = join(webRoot, 'src/assets/og');
/** Inline as data: URLs — a page opened with setContent may not load file:// fonts or images. */
const dataUrl = (path, type) => `data:${type};base64,${readFileSync(path).toString('base64')}`;
const font = (pkg, file) =>
  dataUrl(join(webRoot, 'node_modules', pkg, 'files', file), 'font/woff2');

/** Colour tokens, read from tokens.css so the image follows the theme. */
const tokens = readFileSync(join(webRoot, 'src/styles/tokens.css'), 'utf8');
const token = (name) => {
  const m = new RegExp(`--palette-${name}:\\s*(#[0-9a-fA-F]{3,8})`).exec(tokens);
  if (!m) throw new Error(`token --palette-${name} not found`);
  return m[1];
};

const COPY = {
  en: {
    lang: 'en',
    line1: 'Together, we can',
    line2: 'make a difference.',
    area: 'Kanchipuram, Tamil Nadu',
  },
  ta: {
    lang: 'ta',
    line1: 'ஒன்றாகச் சேர்ந்தால்,',
    line2: 'மாற்றம் கொண்டுவர முடியும்.',
    area: 'காஞ்சிபுரம், தமிழ்நாடு',
  },
};

function html({ lang, line1, line2, area }) {
  const emblem = dataUrl(join(webRoot, 'src/assets/brand/emblem.webp'), 'image/webp');
  const head = lang === 'ta' ? `'Noto Sans Tamil', 'Poppins'` : `'Poppins'`;
  const size = lang === 'ta' ? 64 : 84;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>
@font-face{font-family:'Poppins';font-weight:700;src:url(${font('@fontsource/poppins', 'poppins-latin-700-normal.woff2')})}
@font-face{font-family:'Cinzel';font-weight:600;src:url(${font('@fontsource/cinzel', 'cinzel-latin-600-normal.woff2')})}
@font-face{font-family:'Noto Sans Tamil';font-weight:100 900;src:url(${font('@fontsource-variable/noto-sans-tamil', 'noto-sans-tamil-tamil-wght-normal.woff2')})}
@font-face{font-family:'Jakarta';font-weight:200 800;src:url(${font('@fontsource-variable/plus-jakarta-sans', 'plus-jakarta-sans-latin-wght-normal.woff2')})}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;color:${token('white')};
  background:radial-gradient(120% 140% at 100% 0%, ${token('green')} 0%, ${token('green-deep')} 62%);
  font-family:${head}, sans-serif;display:flex;flex-direction:column;justify-content:space-between;padding:64px 80px}
.brand{display:flex;align-items:center;gap:22px}
.brand img{width:96px;height:auto}
.brand span{font-family:'Cinzel',serif;font-weight:600;font-size:40px;letter-spacing:.08em;text-transform:uppercase}
h1{font-weight:700;font-size:${size}px;line-height:1.25}
h1 em{display:block;font-style:normal;color:${token('gold-light')}}
.rule{width:120px;height:6px;border-radius:3px;background:${token('gold')};margin-bottom:22px}
.area{font-family:${lang === 'ta' ? `'Noto Sans Tamil',` : ''}'Jakarta',sans-serif;font-weight:500;font-size:30px;color:${token('mint')}}
</style></head><body>
<div class="brand"><img src="${emblem}" alt=""><span>Theonetrust</span></div>
<h1>${line1}<em>${line2}</em></h1>
<div><div class="rule"></div><p class="area">${area}</p></div>
</body></html>`;
}

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const copy of Object.values(COPY)) {
    await page.setContent(html(copy), { waitUntil: 'load' });
    // Every font and the emblem must have loaded, or the image would silently use a fallback.
    const ok = await page.evaluate(async () => {
      const doc = globalThis.document; // runs in the page, not in Node
      await Promise.allSettled([...doc.fonts].map((f) => f.load()));
      const img = doc.querySelector('img');
      return [...doc.fonts].every((f) => f.status === 'loaded') && img.naturalWidth > 0;
    });
    if (!ok) throw new Error(`fonts or emblem did not load for ${copy.lang}`);
    const file = join(outDir, `share-${copy.lang}.png`);
    await page.screenshot({ path: file, type: 'png' });
    console.log(`wrote ${file}`);
  }
} finally {
  await browser.close();
}
