import { describe, expect, it } from 'vitest';
import { contrast, mixOklab, normalizeHex, resolveColor } from './color.ts';

describe('colour arithmetic', () => {
  it('normalizes short and long hex to lower-case #rrggbb', () => {
    expect(normalizeHex('#FFF')).toBe('#ffffff');
    expect(normalizeHex('#0756F5')).toBe('#0756f5');
    expect(normalizeHex('red')).toBeUndefined();
  });

  it('computes the WCAG contrast ratio', () => {
    expect(contrast('#ffffff', '#000000')).toBeCloseTo(21, 5);
    expect(contrast('#0756f5', '#ffffff')).toBeCloseTo(5.74, 2);
  });

  it('mixes in oklab as CSS color-mix does', () => {
    expect(mixOklab('#0756f5', '#152440', 0.8)).toBe('#0f4dce');
    expect(mixOklab('#0756f5', '#ffffff', 0.9)).toBe('#286bf8');
  });

  it('resolves var() references and color-mix() over a palette', () => {
    const palette = { '--primary': '#0756f5', '--foreground': '#152440', '--hover': 'color-mix(in oklab, var(--primary) 80%, var(--foreground))', '--alias': 'var(--hover)' };
    expect(resolveColor('var(--alias)', palette)).toBe('#0f4dce');
    expect(resolveColor('color-mix(in oklab, #ffffff 50%, #000000 50%)', palette)).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('refuses a value it cannot resolve', () => {
    expect(() => resolveColor('var(--missing)', {})).toThrow(/--missing/);
    expect(() => resolveColor('hsl(220 90% 50%)', {})).toThrow(/cannot resolve/);
    expect(() => resolveColor('var(--a)', { '--a': 'var(--a)' })).toThrow(/cycle/);
  });
});
