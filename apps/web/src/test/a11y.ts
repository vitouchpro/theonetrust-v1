import axe from 'axe-core';
import { expect } from 'vitest';

export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * Runs axe-core against a rendered container (WCAG 2.2 AA tags).
 * Colour contrast cannot be computed in jsdom; Playwright covers it in the browser.
 */
export async function expectNoA11yViolations(container: Element): Promise<void> {
  const results = await axe.run(container, {
    runOnly: { type: 'tag', values: WCAG_TAGS },
    rules: { 'color-contrast': { enabled: false } },
  });
  const summary = results.violations.map(
    (v) => `${v.id} (${v.impact ?? 'unknown'}): ${v.help} — ${v.nodes.length} node(s)`,
  );
  expect(summary, 'axe accessibility violations').toEqual([]);
}
