type Level = 'error' | 'warn';

interface Entry {
  level: Level;
  text: string;
}

const entries: Entry[] = [];
const allowed: RegExp[] = [];

function format(args: unknown[]): string {
  return args
    .map((arg) => (arg instanceof Error ? `${arg.name}: ${arg.message}` : String(arg)))
    .join(' ');
}

export const consoleGuard = {
  reset(): void {
    entries.length = 0;
    allowed.length = 0;
  },
  record(level: Level, args: unknown[]): void {
    entries.push({ level, text: format(args) });
  },
  /**
   * Call inside a test that intentionally triggers console output
   * (e.g. an error boundary test). Be as specific as possible.
   */
  allow(pattern: RegExp): void {
    allowed.push(pattern);
  },
  assertClean(): void {
    const unexpected = entries.filter((e) => !allowed.some((p) => p.test(e.text)));
    if (unexpected.length > 0) {
      throw new Error(
        `Auto bug detector: unexpected console output during test:\n${unexpected
          .map((e) => `  [${e.level}] ${e.text}`)
          .join('\n')}`,
      );
    }
  },
};
