import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { consoleGuard } from './console-guard.ts';

/*
 * Auto bug detector (unit level): any console.error / console.warn during a
 * test fails that test. React warnings (keys, act(), invalid DOM nesting,
 * hydration) surface as real failures instead of noise.
 */
beforeEach(() => {
  consoleGuard.reset();
  for (const level of ['error', 'warn'] as const) {
    vi.spyOn(console, level).mockImplementation((...args: unknown[]) => {
      consoleGuard.record(level, args);
    });
  }
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  consoleGuard.assertClean();
});
