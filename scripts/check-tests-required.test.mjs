import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { evaluate } from './check-tests-required.mjs';

describe('tests-required gate', () => {
  it('passes when nothing in a package src changed', () => {
    assert.equal(evaluate(['README.md', 'docs/x.md', '.github/workflows/ci.yml']).ok, true);
  });

  it('fails when web source changes without any web test', () => {
    const r = evaluate(['apps/web/src/routes/home/HomePage.tsx']);
    assert.equal(r.ok, false);
    assert.deepEqual(r.missing, [
      { pkg: 'apps/web', changed: ['apps/web/src/routes/home/HomePage.tsx'] },
    ]);
  });

  it('accepts a unit test in the same package', () => {
    const r = evaluate(['apps/api/src/app.ts', 'apps/api/src/app.test.ts']);
    assert.equal(r.ok, true);
  });

  it('accepts a Playwright e2e spec for web changes', () => {
    assert.equal(
      evaluate(['apps/web/src/app/RootLayout.tsx', 'apps/web/e2e/smoke.spec.ts']).ok,
      true,
    );
  });

  it('does not let a test in another package satisfy the gate', () => {
    const r = evaluate(['apps/api/src/app.ts', 'apps/web/src/app/routes.test.tsx']);
    assert.equal(r.ok, false);
    assert.equal(r.missing[0].pkg, 'apps/api');
  });

  it('treats CSS changes as behaviour that needs a test', () => {
    assert.equal(evaluate(['apps/web/src/styles/tokens.css']).ok, false);
  });

  it('ignores type declarations and test helpers as sources', () => {
    assert.equal(evaluate(['apps/web/src/vite-env.d.ts']).ok, true);
    assert.equal(evaluate(['apps/web/src/test/a11y.ts']).ok, true);
  });

  it('reports every untested package', () => {
    const r = evaluate(['apps/api/src/a.ts', 'packages/contracts/src/money.ts']);
    assert.deepEqual(
      r.missing.map((m) => m.pkg),
      ['apps/api', 'packages/contracts'],
    );
  });
});
