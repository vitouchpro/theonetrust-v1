import type { Page } from '@playwright/test';
import { expect, test } from './fixtures/guard.ts';

/**
 * Static prerender and SEO files (#16). Reads the raw HTML the way a search engine does (no JavaScript).
 */
test.describe('prerendered HTML (no JavaScript)', () => {
  test('Tamil home: content, lang, canonical, hreflang, JSON-LD and font preload', async ({
    request,
  }) => {
    const html = await (await request.get('/ta/')).text();
    expect(html).toMatch(/<html lang="ta">/);
    expect(html).toContain('<h1 id="hero-title"');
    expect(html).toContain('எங்கே உதவி தேவை');
    expect(html).toContain(
      '<link data-prerender rel="canonical" href="https://theonetrust.in/ta/" />',
    );
    expect(html).toContain('hreflang="x-default"');
    expect(html).toContain('application/ld+json');
    expect(html).toMatch(
      /rel="preload" href="\/assets\/noto-sans-tamil-tamil-[^"]+\.woff2" as="font"/,
    );
    expect(html.match(/<title[ >]/g)).toHaveLength(1);
    expect(html.match(/rel="canonical"/g)).toHaveLength(1);
    expect(html).toMatch(
      /property="og:image" content="https:\/\/theonetrust\.in\/assets\/share-ta-[^"]+\.png"/,
    );
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
  });

  for (const lang of ['en', 'ta'] as const) {
    test(`share image (${lang}) is served as a 1200 × 630 PNG`, async ({ request }) => {
      const html = await (await request.get(lang === 'ta' ? '/ta/' : '/')).text();
      const src = /property="og:image" content="https:\/\/[^/]+(\/assets\/[^"]+\.png)"/.exec(
        html,
      )?.[1];
      expect(src).toBeTruthy();
      const res = await request.get(src!);
      expect(res.ok()).toBe(true);
      expect(res.headers()['content-type']).toContain('image/png');
      const png = await res.body();
      expect(png.readUInt32BE(16)).toBe(1200);
      expect(png.readUInt32BE(20)).toBe(630);
    });
  }

  for (const path of ['/terms', '/ta/privacy', '/refund-policy']) {
    test(`${path} is prerendered`, async ({ request }) => {
      const html = await (await request.get(path)).text();
      expect(html).toContain('<h1 id="policy-title">');
      expect(html).toContain(
        `<link data-prerender rel="canonical" href="https://theonetrust.in${path}" />`,
      );
    });
  }

  test('sitemap.xml and robots.txt are served', async ({ request }) => {
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBe(true);
    expect(await sitemap.text()).toContain('<loc>https://theonetrust.in/ta/refund-policy</loc>');
    expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /admin');
  });
});

test('the app takes over the prerendered page without console errors', async ({ page }) => {
  await page.goto('/ta/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ta');
  await page.locator('#top').getByRole('link', { name: 'உதவி பெற' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
});

/** One set of head tags once the app runs, and it follows a language switch (#151). */
async function headCounts(page: Page) {
  return page.evaluate(() => ({
    title: document.head.querySelectorAll('title').length,
    canonical: document.head.querySelectorAll('link[rel="canonical"]').length,
    description: document.head.querySelectorAll('meta[name="description"]').length,
    alternate: document.head.querySelectorAll('link[rel="alternate"]').length,
    ogImage: document.head.querySelectorAll('meta[property="og:image"]').length,
    prerendered: document.head.querySelectorAll('[data-prerender]').length,
    href: document.head.querySelector('link[rel="canonical"]')?.getAttribute('href'),
  }));
}

test('head tags appear once after the app starts and after a language switch', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect
    .poll(() => headCounts(page))
    .toEqual({
      title: 1,
      canonical: 1,
      description: 1,
      alternate: 3,
      ogImage: 1,
      prerendered: 0,
      href: 'https://theonetrust.in/',
    });
  const switchGroup = page.getByRole('contentinfo').getByRole('group', { name: 'Language' });
  await switchGroup.getByRole('button', { name: 'தமிழ்' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ta');
  await expect
    .poll(() => headCounts(page))
    .toEqual({
      title: 1,
      canonical: 1,
      description: 1,
      alternate: 3,
      ogImage: 1,
      prerendered: 0,
      href: 'https://theonetrust.in/ta/',
    });
});

test('a page without its own canonical keeps none from the prerendered home', async ({ page }) => {
  await page.goto('/missing-page');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const counts = await headCounts(page);
  expect(counts.canonical).toBe(0);
  expect(counts.title).toBe(1);
  expect(await page.locator('head meta[name="robots"]').count()).toBe(1);
});
