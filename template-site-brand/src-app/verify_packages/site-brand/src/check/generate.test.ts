import { describe, expect, it } from 'vitest';
import { GUIDELINE_END, GUIDELINE_START, renderThemeTs, renderTokenTable, renderTokensCss, spliceTable } from './generate.ts';
import { loadBrand, readKit } from './model.ts';
import { KIT_CSS, goodBrandJson } from '../test-support/fixtures.ts';

const brand = loadBrand(JSON.stringify(goodBrandJson()));
const kit = readKit(KIT_CSS);

describe('tokens.css', () => {
  const css = renderTokensCss(brand);

  it('puts the light values under the selector that outranks the kit light block, and skips rows not adopted', () => {
    const light = css.slice(css.indexOf(":root:not([data-theme='dark']),"), css.indexOf("[data-theme='dark'] {"));
    expect(light).toContain("[data-theme='light']:not([data-theme='dark']) {");
    expect(light).toContain('--primary: #0756f5;');
    expect(light).toContain('--primary-hover: color-mix(in oklab, var(--primary) 80%, var(--foreground));');
    expect(light).toContain('--site-nav-foreground: #283349;');
    expect(css).not.toContain('--secondary:');
  });

  it('writes the dark resets on every dark scope and the theme-invariant tokens on :root', () => {
    expect(css).toMatch(/\[data-theme='dark'\] \{\n(?:\s+\/\*.*\*\/\n)?\s+--site-nav-foreground: var\(--foreground\);/);
    expect(css).toMatch(/\n:root \{\n[\s\S]*--site-weight-title: 560;[\s\S]*--site-night: #10234b;/);
  });

  it('names its source and is stable', () => {
    expect(css.startsWith('/*')).toBe(true);
    expect(css).toContain('brand.json');
    expect(renderTokensCss(brand)).toBe(css);
  });
});

describe('theme.ts', () => {
  const ts = renderThemeTs(brand, kit);

  it('carries the kit light palette with the brand overrides applied, in kit order', () => {
    expect(ts).toContain("'--background': '#ffffff',");
    expect(ts).toContain("'--primary': '#0756f5',");
    expect(ts).toContain("'--secondary': '#eef2f7',");
    expect(ts).toContain("'--muted-foreground': '#334155',");
    expect(ts.indexOf("'--background'")).toBeLessThan(ts.indexOf("'--muted-foreground'"));
    expect(ts).not.toContain('color-scheme');
    expect(ts).not.toContain('--site-nav-foreground');
  });

  it('carries the kit dark palette unchanged and declares both appearances', () => {
    const dark = ts.slice(ts.indexOf('brandDarkVariables'));
    expect(dark).toContain("'--muted-foreground': '#94a3b8',");
    expect(ts).toMatch(/appearance: 'light'/);
    expect(ts).toMatch(/appearance: 'dark'/);
  });
});

describe('guideline table', () => {
  it('lists every row with our value, the V2 value and the reason', () => {
    const table = renderTokenTable(brand);
    expect(table).toContain('| `--primary` | `#0756f5` | `#0756f5` |');
    expect(table).toContain('| `--secondary` | not adopted | `#edf1f8` |');
    expect(table).toContain('Not adopted');
    expect(table).toContain('`themeColor`');
  });

  it('replaces only the text between the markers', () => {
    const text = `# Guide\n\n${GUIDELINE_START}\nold\n${GUIDELINE_END}\n\nAfter.\n`;
    const out = spliceTable(text, 'NEW');
    expect(out).toBe(`# Guide\n\n${GUIDELINE_START}\nNEW\n${GUIDELINE_END}\n\nAfter.\n`);
    expect(() => spliceTable('# no markers', 'x')).toThrow(/markers/);
  });
});
