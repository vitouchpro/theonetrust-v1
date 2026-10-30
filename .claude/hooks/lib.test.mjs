import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  findSecrets,
  isProductionSource,
  isSecretScanExempt,
  shouldRunStopGate,
  tail,
} from './lib.mjs';

describe('findSecrets', () => {
  it('flags Razorpay keys, DB URLs with passwords, private keys and PAN-like values', () => {
    assert.deepEqual(findSecrets('key=rzp_test_AbCdEf123456'), ['Razorpay key']);
    assert.deepEqual(findSecrets('postgres://u:pw@host/db'), ['database URL with password']);
    assert.deepEqual(findSecrets('-----BEGIN RSA PRIVATE KEY-----'), ['private key']);
    assert.deepEqual(findSecrets('pan: ABCDE1234F'), ['possible PAN number']);
  });

  it('does not flag ordinary code', () => {
    assert.deepEqual(findSecrets('const DATABASE_URL = env.DATABASE_URL;'), []);
    assert.deepEqual(findSecrets('postgres://host/db'), []);
  });
});

describe('isProductionSource', () => {
  it('accepts package source files', () => {
    assert.equal(isProductionSource('apps/web/src/app/routes.tsx'), true);
    assert.equal(isProductionSource('/abs/repo/apps/api/src/app.ts'), true);
  });
  it('rejects tests, helpers, declarations and non-src files', () => {
    for (const p of [
      'apps/web/src/app/routes.test.tsx',
      'apps/web/src/test/a11y.ts',
      'apps/web/src/vite-env.d.ts',
      'apps/web/e2e/smoke.spec.ts',
      'docs/website-plan.md',
    ]) {
      assert.equal(isProductionSource(p), false, p);
    }
  });
});

describe('isSecretScanExempt', () => {
  it('exempts tests, docs and the env example only', () => {
    assert.equal(isSecretScanExempt('.claude/hooks/lib.test.mjs'), true);
    assert.equal(isSecretScanExempt('.env.example'), true);
    assert.equal(isSecretScanExempt('apps/api/src/config/env.ts'), false);
  });
});

describe('shouldRunStopGate', () => {
  it('runs only when there are changes and the hook is not already active', () => {
    assert.equal(shouldRunStopGate({}, true), true);
    assert.equal(shouldRunStopGate({}, false), false);
    assert.equal(shouldRunStopGate({ stop_hook_active: true }, true), false);
    assert.equal(shouldRunStopGate(undefined, true), true);
  });
});

describe('tail', () => {
  it('keeps short output unchanged and truncates long output from the top', () => {
    assert.equal(tail('a\nb', 5), 'a\nb');
    const out = tail(Array.from({ length: 10 }, (_, i) => `l${i}`).join('\n'), 3);
    assert.equal(out, '…(truncated)…\nl7\nl8\nl9');
  });
});

describe('isSecretScanExempt (docs)', () => {
  it('exempts relative and absolute docs paths', () => {
    assert.equal(isSecretScanExempt('docs/research/payments.md'), true);
    assert.equal(isSecretScanExempt('/repo/docs/x.md'), true);
  });
});
