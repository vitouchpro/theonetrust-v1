import { expect, test } from './fixtures/guard.ts';

/**
 * Link crawler: starts at "/" and visits every internal link it finds
 * (breadth-first, capped). The auto bug detector runs on the final page,
 * and this test checks every visited page for errors and broken links,
 * so new pages are covered automatically as the site grows.
 */
const MAX_PAGES = 50;

test('every internal page loads without errors', async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const queue = ['/'];
  const seen = new Set<string>(queue);
  const failures: string[] = [];
  const pageErrors: string[] = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') pageErrors.push(msg.text());
  });

  while (queue.length && seen.size <= MAX_PAGES) {
    const path = queue.shift()!;
    const before = pageErrors.length;
    const res = await page.goto(path);
    if (!res || res.status() >= 400)
      failures.push(`${path} → HTTP ${res?.status() ?? 'no response'}`);
    if (pageErrors.length > before)
      failures.push(`${path} → ${pageErrors.slice(before).join('; ')}`);

    const hrefs = await page
      .locator('a[href]')
      .evaluateAll((links) => links.map((a) => (a as HTMLAnchorElement).href));
    for (const href of hrefs) {
      const url = new URL(href);
      if (url.origin !== origin) continue;
      const key = url.pathname + url.search;
      if (!seen.has(key)) {
        seen.add(key);
        queue.push(key);
      }
    }
  }

  expect(failures, `crawled ${seen.size} page(s)`).toEqual([]);
});
