/**
 * The eight rules of `brand:check`. Each returns its errors as lines; an empty list passes.
 */
import { contrast, normalizeHex, resolveColor } from './color.ts';
import { allRows, brandNames, type Brand, type BrandRow, type Kit } from './model.ts';

export interface Generated {
  readonly expected: string;
  readonly actual: string;
}

export interface Source {
  /** Shown in errors; relative to the project. */
  readonly path: string;
  readonly text: string;
}

export interface CheckInput {
  readonly brand: Brand;
  readonly kit: Kit;
  readonly generated: { readonly tokensCss: Generated; readonly themeTs: Generated; readonly guideline?: Generated };
  readonly sources: readonly Source[];
  /** The package's own art: its reads count for rule 6, and no other rule scans it (art palettes hold literals by design). */
  readonly artSources?: readonly Source[];
  readonly config: Readonly<Record<string, unknown>> | undefined;
}

// @cpt-algo:cpt-template-site-brand-algo-brand-check-generated:p1
/** Rule 1: tokens.css, theme.ts and the guideline table equal what brand.json generates now. */
export function checkGenerated(generated: CheckInput['generated']): string[] {
  // @cpt-begin:cpt-template-site-brand-algo-brand-check-generated:p1:inst-compare-generated
  const files = [
    ['src/tokens.css', generated.tokensCss],
    ['src/theme.ts', generated.themeTs],
    ['the guideline brand.md token table', generated.guideline],
  ] as const;
  return files.filter(([, file]) => file && file.expected !== file.actual).map(([name]) => `${name} differs from what brand.json generates; run brand:generate`);
  // @cpt-end:cpt-template-site-brand-algo-brand-check-generated:p1:inst-compare-generated
}

// @cpt-algo:cpt-template-site-brand-algo-brand-check-kit-names:p1
/** Rule 2: every override names a token the installed kit declares, and no brand token takes a name the kit declares. */
export function checkKitNames(brand: Brand, kit: Kit): string[] {
  // @cpt-begin:cpt-template-site-brand-algo-brand-check-kit-names:p1:inst-overrides-in-kit
  const errors = brand.light.overrides.filter((row) => !kit.names.has(row.token)).map((row) => `light.overrides: ${row.token} is not a kit token (the installed kit theme.css does not declare it)`);
  // @cpt-end:cpt-template-site-brand-algo-brand-check-kit-names:p1:inst-overrides-in-kit
  // @cpt-begin:cpt-template-site-brand-algo-brand-check-kit-names:p1:inst-tokens-not-in-kit
  for (const row of [...brand.light.tokens, ...brand.invariant]) if (kit.names.has(row.token)) errors.push(`${row.token} is a brand token, but the kit declares it; record it as an override`);
  return errors;
  // @cpt-end:cpt-template-site-brand-algo-brand-check-kit-names:p1:inst-tokens-not-in-kit
}

const FRAGMENT = /^-?\d+(\.\d+)?(deg)?\s+-?\d+(\.\d+)?%?\s+-?\d+(\.\d+)?%?(\s*\/\s*[\d.]+%?)?$/;
const FULL_COLOUR = /^(#[0-9a-f]{3,8}|(rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color|color-mix|var)\(.*\)|transparent|currentcolor)$/i;
const REWRAP = /\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(\s*var\(/i;
const LITERAL_ALPHA = /#[0-9a-f]{8}\b|#[0-9a-f]{4}\b|\b(rgba?|hsla?)\([^)]*(,\s*[\d.]+%?\s*\)|\/\s*[\d.]+%?\s*\))/i;

// @cpt-algo:cpt-template-site-brand-algo-brand-check-value-rules:p1
/** Rule 3: the five value rules of the design guardrails' create-theme skill, on every adopted value. */
export function checkValueRules(brand: Brand): string[] {
  const errors: string[] = [];
  // @cpt-begin:cpt-template-site-brand-algo-brand-check-value-rules:p1:inst-appearance
  if (brand.light.appearance !== 'light') errors.push(`the light palette declares appearance ${JSON.stringify(brand.light.appearance)}; it must be 'light'`);
  if (brand.dark.appearance !== 'dark') errors.push(`the dark palette declares appearance ${JSON.stringify(brand.dark.appearance)}; it must be 'dark'`);
  // @cpt-end:cpt-template-site-brand-algo-brand-check-value-rules:p1:inst-appearance
  const colour = (row: BrandRow, section: string) => section !== 'invariant' || row.type === 'color';
  const rows = [...allRows(brand), ...(['themeColor', 'backgroundColor'] as const).map((key) => ({ section: 'head', row: { token: key, ...brand.head[key] } as BrandRow }))];
  for (const { section, row } of rows) {
    if (row.value === null) continue;
    const value = row.value.trim();
    // @cpt-begin:cpt-template-site-brand-algo-brand-check-value-rules:p1:inst-full-colour
    if (FRAGMENT.test(value)) errors.push(`${section}: ${row.token} is a colour fragment (${value}); write a full CSS colour`);
    else if (colour(row, section) && !FULL_COLOUR.test(value)) errors.push(`${section}: ${row.token} is not a full CSS colour (${value})`);
    // @cpt-end:cpt-template-site-brand-algo-brand-check-value-rules:p1:inst-full-colour
    // @cpt-begin:cpt-template-site-brand-algo-brand-check-value-rules:p1:inst-derived
    if (colour(row, section) && LITERAL_ALPHA.test(value)) errors.push(`${section}: ${row.token} carries a literal alpha (${value}); derive it with color-mix(in oklab, var(--base) N%, transparent)`);
    const hover = /^(--[\w-]+)-hover$/.exec(row.token);
    if (hover && !new RegExp(`^color-mix\\(\\s*in\\s+oklab\\s*,\\s*var\\(\\s*${hover[1]}\\s*\\)`).test(value)) errors.push(`${section}: ${row.token} must derive from its base with color-mix(in oklab, var(${hover[1]}) N%, ...), not ${value}`);
    // @cpt-end:cpt-template-site-brand-algo-brand-check-value-rules:p1:inst-derived
    // @cpt-begin:cpt-template-site-brand-algo-brand-check-value-rules:p1:inst-no-rewrap
    if (REWRAP.test(value)) errors.push(`${section}: ${row.token} re-wraps a token (${value}); a token holds a full colour, read it as var(--x)`);
    // @cpt-end:cpt-template-site-brand-algo-brand-check-value-rules:p1:inst-no-rewrap
  }
  return errors;
}

// @cpt-algo:cpt-template-site-brand-algo-brand-check-contrast:p1
/** Rule 4: every recorded background and text pair keeps 4.5:1 in its appearance, when the brand declares either side. */
export function checkContrast(brand: Brand, kit: Kit): string[] {
  const errors: string[] = [];
  const adopted = (rows: readonly BrandRow[]) => Object.fromEntries(rows.filter((row) => row.value !== null).map((row) => [row.token, row.value as string]));
  // @cpt-begin:cpt-template-site-brand-algo-brand-check-contrast:p1:inst-palettes
  const lightBrand = { ...adopted(brand.light.overrides), ...adopted(brand.light.tokens) };
  const darkBrand = adopted(brand.dark.tokens);
  const appearances = [
    { name: 'light', palette: { ...kit.light, ...lightBrand }, own: lightBrand, pairs: brand.pairs.light },
    { name: 'dark', palette: { ...kit.dark, ...darkBrand }, own: darkBrand, pairs: brand.pairs.dark },
  ];
  // @cpt-end:cpt-template-site-brand-algo-brand-check-contrast:p1:inst-palettes
  for (const { name, palette, own, pairs } of appearances) {
    for (const [background, text] of pairs) {
      // @cpt-begin:cpt-template-site-brand-algo-brand-check-contrast:p1:inst-pair-ratio
      if (!(background in own || text in own) && background in palette && text in palette) continue;
      try {
        const ratio = contrast(resolveColor(`var(${background})`, palette), resolveColor(`var(${text})`, palette));
        if (!(ratio >= 4.5)) errors.push(`${name} ${background}/${text} ${ratio.toFixed(2)}:1, under 4.5:1`);
      } catch (error) {
        errors.push(`${name} ${background}/${text}: ${error instanceof Error ? error.message : String(error)}`);
      }
      // @cpt-end:cpt-template-site-brand-algo-brand-check-contrast:p1:inst-pair-ratio
    }
  }
  return errors;
}

/** A value as rendered: lower-case 6-digit hex, rem as px (16px root), single spaces, no space after an opening or before a closing parenthesis. */
function normalizeValue(value: string): string {
  return value
    .trim()
    .replace(/#[0-9a-f]{3,6}\b/gi, (hex) => normalizeHex(hex) ?? hex.toLowerCase())
    .replace(/(\d*\.?\d+)rem\b/g, (_, n: string) => `${Number(n) * 16}px`)
    .replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s*,\s*/g, ', ');
}

// @cpt-algo:cpt-template-site-brand-algo-brand-check-v2-record:p1
/** Rule 5: every row records a V2 value (null when V2 has none), and a value that differs from it carries a reason. */
export function checkV2Record(brand: Brand): string[] {
  const errors: string[] = [];
  const rows = [...allRows(brand), ...(['themeColor', 'backgroundColor'] as const).map((key) => ({ section: 'head', row: { token: key, ...brand.head[key] } as BrandRow }))];
  for (const { section, row } of rows) {
    // @cpt-begin:cpt-template-site-brand-algo-brand-check-v2-record:p1:inst-has-v2
    if (!('v2' in row) || row.v2 === undefined) {
      errors.push(`${section}: ${row.token} has no V2 value (write null when V2 has none)`);
      continue;
    }
    // @cpt-end:cpt-template-site-brand-algo-brand-check-v2-record:p1:inst-has-v2
    // @cpt-begin:cpt-template-site-brand-algo-brand-check-v2-record:p1:inst-reason
    const same = row.v2 !== null && row.value !== null && normalizeValue(row.v2) === normalizeValue(row.value);
    if (!same && !(typeof row.reason === 'string' && row.reason.trim() !== '')) errors.push(`${section}: ${row.token} differs from V2 (${row.v2 ?? 'none'}) with no reason`);
    // @cpt-end:cpt-template-site-brand-algo-brand-check-v2-record:p1:inst-reason
  }
  return errors;
}

const READ = /var\(\s*(--[\w-]+)/g;
const stripComments = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' ')).replace(/(^|[^:'"])\/\/[^\n]*/g, (_, before: string) => before);

// @cpt-algo:cpt-template-site-brand-algo-brand-check-use:p1
/** Rule 6: every brand token (light, dark reset or theme-invariant) is read by some source or by the package's art. */
export function checkUse(brand: Brand, sources: readonly Source[], artSources: readonly Source[] = []): string[] {
  // @cpt-begin:cpt-template-site-brand-algo-brand-check-use:p1:inst-collect-reads
  const read = new Set([...sources, ...artSources].flatMap((source) => [...stripComments(source.text).matchAll(READ)].map((match) => match[1])));
  // @cpt-end:cpt-template-site-brand-algo-brand-check-use:p1:inst-collect-reads
  // @cpt-begin:cpt-template-site-brand-algo-brand-check-use:p1:inst-unread
  return [...brand.light.tokens, ...brand.invariant].filter((row) => !read.has(row.token)).map((row) => `${row.token} is read nowhere; delete it from brand.json or use it`);
  // @cpt-end:cpt-template-site-brand-algo-brand-check-use:p1:inst-unread
}

// @cpt-algo:cpt-template-site-brand-algo-brand-check-one-source:p1
/** Rule 7: no source outside this package declares a brand token or a kit token the brand overrides. */
export function checkOneSource(brand: Brand, sources: readonly Source[]): string[] {
  const owned = brandNames(brand);
  const errors: string[] = [];
  for (const source of sources) {
    // @cpt-begin:cpt-template-site-brand-algo-brand-check-one-source:p1:inst-find-declarations
    const lines = stripComments(source.text).split('\n');
    lines.forEach((line, index) => {
      for (const match of line.matchAll(/(?<![\w-])['"]?(--[a-zA-Z0-9-]+)['"]?\s*:(?!:)/g)) {
        if (owned.has(match[1]) && !line.slice(0, match.index).trimEnd().endsWith('var(')) errors.push(`${source.path}:${index + 1} declares ${match[1]}, which only brand.json declares`);
      }
    });
    // @cpt-end:cpt-template-site-brand-algo-brand-check-one-source:p1:inst-find-declarations
  }
  return errors;
}

// @cpt-algo:cpt-template-site-brand-algo-brand-check-head:p1
/** Rule 8: the site config's head colours equal the brand record. */
export function checkHead(brand: Brand, config: CheckInput['config']): string[] {
  // @cpt-begin:cpt-template-site-brand-algo-brand-check-head:p1:inst-head-config
  if (!config) return ['no site config to check the head colours against; pass --config <site.config.json>'];
  // @cpt-end:cpt-template-site-brand-algo-brand-check-head:p1:inst-head-config
  // @cpt-begin:cpt-template-site-brand-algo-brand-check-head:p1:inst-head-compare
  return (['themeColor', 'backgroundColor'] as const)
    .filter((key) => normalizeHex(String(config[key] ?? '')) !== normalizeHex(brand.head[key].value))
    .map((key) => `site config ${key} ${String(config[key] ?? '(missing)')} differs from the brand's ${brand.head[key].value}`);
  // @cpt-end:cpt-template-site-brand-algo-brand-check-head:p1:inst-head-compare
}

// @cpt-algo:cpt-template-site-brand-algo-brand-check-run-rules:p1
/** Every rule, in order. */
export function runChecks(input: CheckInput): string[] {
  // @cpt-begin:cpt-template-site-brand-algo-brand-check-run-rules:p1:inst-all-rules
  return [
    ...checkGenerated(input.generated),
    ...checkKitNames(input.brand, input.kit),
    ...checkValueRules(input.brand),
    ...checkContrast(input.brand, input.kit),
    ...checkV2Record(input.brand),
    ...checkUse(input.brand, input.sources, input.artSources),
    ...checkOneSource(input.brand, input.sources),
    ...checkHead(input.brand, input.config),
  ];
  // @cpt-end:cpt-template-site-brand-algo-brand-check-run-rules:p1:inst-all-rules
}
