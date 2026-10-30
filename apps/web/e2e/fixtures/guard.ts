import AxeBuilder from '@axe-core/playwright';
import { test as base, expect, type Page, type TestInfo } from '@playwright/test';

/**
 * AUTO BUG DETECTOR — applied automatically to every e2e test.
 *
 * After each test it fails the test if the page produced:
 *  1. a console error or warning (React warnings, CSP violations, failed hydration…)
 *  2. an uncaught page exception
 *  3. a failed network request or an HTTP 4xx/5xx from our own origin
 *  4. horizontal overflow (content wider than the viewport)
 *  5. WCAG 2.2 AA violations found by axe-core (incl. colour contrast)
 *  6. a document without lang, title, exactly one <h1> or a <main> landmark
 *
 * Opt out per test only with a reason:
 *   test.use({ guard: { allowConsole: [/expected message/], skipAxe: 'reason' } })
 */
export interface GuardOptions {
  allowConsole: RegExp[];
  allowFailedRequests: RegExp[];
  skipAxe: string | false;
  skipOverflow: string | false;
  skipDocumentChecks: string | false;
}

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

interface Problems {
  console: string[];
  pageErrors: string[];
  network: string[];
}

function collect(page: Page, opts: GuardOptions, baseURL: string | undefined): Problems {
  const problems: Problems = { console: [], pageErrors: [], network: [] };
  const origin = baseURL ? new URL(baseURL).origin : undefined;

  page.on('console', (msg) => {
    if (msg.type() !== 'error' && msg.type() !== 'warning') return;
    const text = `[${msg.type()}] ${msg.text()}`;
    if (!opts.allowConsole.some((p) => p.test(text))) problems.console.push(text);
  });
  page.on('pageerror', (err) => problems.pageErrors.push(`${err.name}: ${err.message}`));
  page.on('requestfailed', (req) => {
    const text = `${req.method()} ${req.url()} — ${req.failure()?.errorText ?? 'failed'}`;
    // Navigations aborted by the test itself are not bugs.
    if (req.failure()?.errorText === 'net::ERR_ABORTED') return;
    if (!opts.allowFailedRequests.some((p) => p.test(req.url()))) problems.network.push(text);
  });
  page.on('response', (res) => {
    if (res.status() < 400) return;
    if (origin && new URL(res.url()).origin !== origin) return;
    if (opts.allowFailedRequests.some((p) => p.test(res.url()))) return;
    problems.network.push(`HTTP ${res.status()} ${res.request().method()} ${res.url()}`);
  });
  return problems;
}

async function documentChecks(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const issues: string[] = [];
    const root = document.documentElement;
    if (!root.lang) issues.push('<html> has no lang attribute');
    if (!document.title.trim()) issues.push('document has an empty <title>');
    const h1s = document.querySelectorAll('h1').length;
    if (h1s !== 1) issues.push(`expected exactly one <h1>, found ${h1s}`);
    if (!document.querySelector('main')) issues.push('no <main> landmark');
    const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dupes.length) issues.push(`duplicate ids: ${[...new Set(dupes)].join(', ')}`);
    const unnamedLinks = [...document.querySelectorAll('a[href]')].filter(
      (a) => !(a.textContent ?? '').trim() && !a.getAttribute('aria-label'),
    ).length;
    if (unnamedLinks) issues.push(`${unnamedLinks} link(s) without an accessible name`);
    return issues;
  });
}

async function overflow(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const doc = document.documentElement;
    if (doc.scrollWidth <= doc.clientWidth) return null;
    const offenders = [...document.querySelectorAll('body *')]
      .filter((el) => el.getBoundingClientRect().right > doc.clientWidth + 1)
      .slice(0, 5)
      .map((el) => el.tagName.toLowerCase() + (el.id ? `#${el.id}` : ''));
    return `page is ${doc.scrollWidth}px wide in a ${doc.clientWidth}px viewport (offenders: ${offenders.join(', ')})`;
  });
}

async function report(testInfo: TestInfo, findings: string[]): Promise<void> {
  if (!findings.length) return;
  await testInfo.attach('auto-bug-detector.txt', {
    body: findings.join('\n'),
    contentType: 'text/plain',
  });
}

export const test = base.extend<{ guard: GuardOptions; autoGuard: undefined }>({
  guard: [
    {
      allowConsole: [],
      allowFailedRequests: [],
      skipAxe: false,
      skipOverflow: false,
      skipDocumentChecks: false,
    },
    { option: true },
  ],
  autoGuard: [
    async ({ page, guard, baseURL }, use, testInfo) => {
      const problems = collect(page, guard, baseURL);
      await use(undefined);

      // Only inspect pages the test actually opened, and don't pile onto a test that already failed.
      const bodyFailed = ['failed', 'timedOut', 'interrupted'].includes(testInfo.status ?? '');
      if (page.url() === 'about:blank' || bodyFailed) return;

      const findings: string[] = [
        ...problems.console.map((m) => `console: ${m}`),
        ...problems.pageErrors.map((m) => `page exception: ${m}`),
        ...problems.network.map((m) => `network: ${m}`),
      ];

      if (!guard.skipDocumentChecks) {
        findings.push(...(await documentChecks(page)).map((m) => `document: ${m}`));
      }
      if (!guard.skipOverflow) {
        const o = await overflow(page);
        if (o) findings.push(`layout: ${o}`);
      }
      if (!guard.skipAxe) {
        const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
        for (const v of results.violations) {
          const targets = v.nodes
            .slice(0, 3)
            .map((n) => n.target.join(' '))
            .join(' | ');
          findings.push(`a11y: ${v.id} (${v.impact ?? 'unknown'}) ${v.help} → ${targets}`);
        }
      }

      await report(testInfo, findings);
      expect(findings, `Auto bug detector found problems on ${page.url()}`).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
