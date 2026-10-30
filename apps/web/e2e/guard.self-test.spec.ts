import { expect, test } from './fixtures/guard.ts';

/**
 * Self-tests for the auto bug detector. Each case serves a deliberately
 * broken page from our own origin; `test.fail()` asserts the guard catches it.
 * If the guard ever stops detecting a class of bug, these tests go red.
 */
const GOOD_HEAD = '<meta charset="utf-8"><title>Fixture</title>';

function html(head: string, body: string, lang = 'en'): string {
  return `<!doctype html><html lang="${lang}"><head>${head}</head><body>${body}</body></html>`;
}

const VALID_BODY = '<main><h1>Fixture</h1><p>Content</p></main>';

const brokenPages: Record<string, string> = {
  'console error': html(GOOD_HEAD, `${VALID_BODY}<script>console.error('boom')</script>`),
  'uncaught exception': html(GOOD_HEAD, `${VALID_BODY}<script>throw new Error('crash')</script>`),
  'horizontal overflow': html(
    GOOD_HEAD,
    `<main><h1>Fixture</h1><div style="width:3000px">wide</div></main>`,
  ),
  'missing lang': html(GOOD_HEAD, VALID_BODY, ''),
  'two h1 headings': html(GOOD_HEAD, '<main><h1>One</h1><h1>Two</h1></main>'),
  'image without alt (axe)': html(
    GOOD_HEAD,
    '<main><h1>Fixture</h1><img src="data:image/gif;base64,R0lGODlhAQABAAAAACw="></main>',
  ),
  'low contrast text (axe)': html(
    GOOD_HEAD,
    '<main><h1>Fixture</h1><p style="color:#eee;background:#fff">faint</p></main>',
  ),
  'broken same-origin asset': html(
    GOOD_HEAD,
    `${VALID_BODY}<script src="/__missing-asset.js"></script>`,
  ),
};

for (const [name, body] of Object.entries(brokenPages)) {
  test(`detects: ${name}`, async ({ page }) => {
    test.fail(true, 'the auto bug detector must fail this test');
    await page.route('**/__guard-fixture', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body }),
    );
    await page.goto('/__guard-fixture');
  });
}

test('passes a clean page', async ({ page }) => {
  await page.route('**/__guard-fixture', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: html(GOOD_HEAD, VALID_BODY) }),
  );
  await page.goto('/__guard-fixture');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
