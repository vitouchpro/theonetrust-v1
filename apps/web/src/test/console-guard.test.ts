import { describe, expect, it } from 'vitest';
import { consoleGuard } from './console-guard.ts';

describe('consoleGuard (auto bug detector)', () => {
  it('passes when nothing was logged', () => {
    consoleGuard.reset();
    expect(() => consoleGuard.assertClean()).not.toThrow();
  });

  it('fails on unexpected console output and names the message', () => {
    consoleGuard.reset();
    consoleGuard.record('error', [new Error('Each child in a list should have a unique "key"')]);
    expect(() => consoleGuard.assertClean()).toThrow(/unique "key"/);
    consoleGuard.reset();
  });

  it('ignores only explicitly allowed messages', () => {
    consoleGuard.reset();
    consoleGuard.allow(/expected boom/);
    consoleGuard.record('error', ['expected boom']);
    consoleGuard.record('warn', ['something else']);
    expect(() => consoleGuard.assertClean()).toThrow(/something else/);
    consoleGuard.reset();
  });
});
