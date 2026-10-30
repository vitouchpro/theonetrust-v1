import { describe, expect, it } from 'vitest';
import {
  contrastRatio,
  contrastTableMarkdown,
  evaluateContrast,
  parseHex,
  parseRootTokens,
  referencedTokens,
  relativeLuminance,
  resolveToken,
} from './design-tokens.ts';

describe('parseRootTokens', () => {
  it('reads declarations from :root and ignores comments', () => {
    const tokens = parseRootTokens(
      ':root {\n  /* --ignored: 1; */\n  --a: #fff;\n  --b: var(--a);\n}',
    );
    expect([...tokens]).toEqual([
      ['--a', '#fff'],
      ['--b', 'var(--a)'],
    ]);
  });

  it('returns an empty map when there is no :root block', () => {
    expect(parseRootTokens('body { color: red; }').size).toBe(0);
  });
});

describe('resolveToken', () => {
  const tokens = new Map([
    ['--a', '#000000'],
    ['--b', 'var(--a)'],
    ['--c', 'var(--b)'],
    ['--loop1', 'var(--loop2)'],
    ['--loop2', 'var(--loop1)'],
    ['--broken', 'var(--missing)'],
  ]);

  it('follows chains of var() references', () => {
    expect(resolveToken(tokens, '--c')).toBe('#000000');
  });

  it('throws on unknown tokens and broken references', () => {
    expect(() => resolveToken(tokens, '--nope')).toThrow('Unknown token: --nope');
    expect(() => resolveToken(tokens, '--broken')).toThrow('Unknown token: --missing');
  });

  it('throws on circular references instead of looping forever', () => {
    expect(() => resolveToken(tokens, '--loop1')).toThrow(/Circular token reference/);
  });
});

describe('referencedTokens', () => {
  it('lists each referenced custom property once, including fallbacks', () => {
    expect(referencedTokens('a{color:var(--x);b:var( --y, red);c:var(--x)}')).toEqual([
      '--x',
      '--y',
    ]);
  });
});

describe('colour maths', () => {
  it('parses 3- and 6-digit hex', () => {
    expect(parseHex('#fff')).toEqual([255, 255, 255]);
    expect(parseHex('#172B46')).toEqual([23, 43, 70]);
  });

  it.each(['172b46', '#12', '#gggggg', 'rgb(0,0,0)', ''])('rejects invalid colour %s', (value) => {
    expect(() => parseHex(value)).toThrow(/Not a hex colour/);
  });

  it('computes luminance at the extremes', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#ffffff')).toBe(1);
  });

  it('computes the maximum contrast and is order-independent', () => {
    expect(contrastRatio('#000', '#fff')).toBe(21);
    expect(contrastRatio('#fff', '#000')).toBe(21);
    expect(contrastRatio('#777', '#777')).toBe(1);
  });

  it('rounds down so a borderline pair cannot round up into a pass', () => {
    // #767676 on white is the classic 4.54:1; #777777 is 4.47:1 and must stay below 4.5.
    expect(contrastRatio('#767676', '#ffffff')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#777777', '#ffffff')).toBeLessThan(4.5);
  });
});

describe('evaluateContrast / contrastTableMarkdown', () => {
  const tokens = new Map([
    ['--fg', '#777777'],
    ['--bg', '#ffffff'],
  ]);

  it('applies the WCAG minimum for each use', () => {
    const [text, ui] = evaluateContrast(tokens, [
      { fg: '--fg', bg: '--bg', use: 'text', where: 'x' },
      { fg: '--fg', bg: '--bg', use: 'ui', where: 'y' },
    ]);
    expect(text).toMatchObject({ minimum: 4.5, passes: false });
    expect(ui).toMatchObject({ minimum: 3, passes: true });
  });

  it('renders failures visibly in the table', () => {
    const md = contrastTableMarkdown(
      evaluateContrast(tokens, [{ fg: '--fg', bg: '--bg', use: 'text', where: 'Grey text' }]),
    );
    expect(md).toContain(
      '| Grey text | `--fg` #777777 | `--bg` #FFFFFF | text | 4.47:1 | 4.5:1 | ✖ FAIL |',
    );
  });
});
