/**
 * The brand record (`src/brand.json`) and the kit stylesheet as the generator and the check read them.
 */

/** One row of the record: a token, our value (`null` when a V2 value is recorded but not adopted), the V2 value (`null` when V2 has none), the reason for a difference, and the token's role. */
export interface BrandRow {
  readonly token: string;
  readonly value: string | null;
  readonly v2?: string | null;
  readonly reason?: string;
  readonly role: string;
  /** Only on theme-invariant rows: what kind of value the token holds. */
  readonly type?: 'color' | 'image' | 'length' | 'number';
}

export interface HeadRow {
  readonly value: string;
  readonly v2?: string | null;
  readonly reason?: string;
  readonly role: string;
}

export interface Brand {
  readonly light: { readonly appearance: string; readonly overrides: readonly BrandRow[]; readonly tokens: readonly BrandRow[] };
  readonly dark: { readonly appearance: string; readonly tokens: readonly BrandRow[] };
  readonly invariant: readonly BrandRow[];
  readonly pairs: { readonly light: readonly (readonly [string, string])[]; readonly dark: readonly (readonly [string, string])[] };
  readonly head: { readonly themeColor: HeadRow; readonly backgroundColor: HeadRow };
}

export interface Kit {
  /** The kit's light palette (`:root, [data-theme='light']`), in declaration order. */
  readonly light: Readonly<Record<string, string>>;
  /** The kit's dark palette (`[data-theme='dark']`), in declaration order. */
  readonly dark: Readonly<Record<string, string>>;
  /** Every custom property the kit declares anywhere. */
  readonly names: ReadonlySet<string>;
}

export const KIT_LIGHT_SELECTOR = ":root, [data-theme='light']";
export const KIT_DARK_SELECTOR = "[data-theme='dark']";

const ROW_TYPES = new Set(['color', 'image', 'length', 'number']);

// @cpt-algo:cpt-template-site-brand-algo-brand-source-and-generation-load-record:p1
/** Parses and shape-checks the brand record; throws with every shape error found. */
export function loadBrand(text: string): Brand {
  // @cpt-begin:cpt-template-site-brand-algo-brand-source-and-generation-load-record:p1:inst-parse-record
  const json = JSON.parse(text) as Brand;
  const errors: string[] = [];
  // @cpt-end:cpt-template-site-brand-algo-brand-source-and-generation-load-record:p1:inst-parse-record
  // @cpt-begin:cpt-template-site-brand-algo-brand-source-and-generation-load-record:p1:inst-check-rows
  const rowsOf = (where: string, rows: unknown, invariant = false) => {
    if (!Array.isArray(rows)) return errors.push(`${where} must be a list of rows`);
    const seen = new Set<string>();
    for (const row of rows as BrandRow[]) {
      if (typeof row?.token !== 'string' || !/^--[a-z0-9-]+$/.test(row.token)) errors.push(`${where}: ${JSON.stringify(row?.token)} is not a custom property name`);
      else if (seen.has(row.token)) errors.push(`${where}: ${row.token} appears twice`);
      seen.add(row?.token);
      if (!(row?.value === null || typeof row?.value === 'string')) errors.push(`${where}: ${row?.token} needs a value (a string, or null when not adopted)`);
      if (typeof row?.role !== 'string' || row.role.trim() === '') errors.push(`${where}: ${row?.token} needs a role`);
      if (invariant && !ROW_TYPES.has(row?.type as string)) errors.push(`${where}: ${row?.token} needs a type (${[...ROW_TYPES].join(', ')})`);
    }
    return 0;
  };
  rowsOf('light.overrides', json.light?.overrides);
  rowsOf('light.tokens', json.light?.tokens);
  rowsOf('dark.tokens', json.dark?.tokens);
  rowsOf('invariant', json.invariant, true);
  for (const where of ['light.tokens', 'dark.tokens', 'invariant'] as const) {
    const rows = (where === 'invariant' ? json.invariant : where === 'light.tokens' ? json.light?.tokens : json.dark?.tokens) ?? [];
    for (const row of rows) if (row?.value === null) errors.push(`${where}: ${row.token} is a brand token and needs a value`);
  }
  const lightTokens = new Set((json.light?.tokens ?? []).map((row) => row.token));
  for (const row of json.dark?.tokens ?? []) if (!lightTokens.has(row.token)) errors.push(`dark.tokens: ${row.token} resets no light token`);
  for (const side of ['light', 'dark'] as const) {
    const pairs = json.pairs?.[side];
    if (!Array.isArray(pairs) || pairs.some((pair) => !Array.isArray(pair) || pair.length !== 2)) errors.push(`pairs.${side} must be a list of [background, text] pairs`);
  }
  for (const key of ['themeColor', 'backgroundColor'] as const) {
    const row = json.head?.[key];
    if (typeof row?.value !== 'string' || typeof row?.role !== 'string') errors.push(`head.${key} needs a value and a role`);
  }
  // @cpt-end:cpt-template-site-brand-algo-brand-source-and-generation-load-record:p1:inst-check-rows
  // @cpt-begin:cpt-template-site-brand-algo-brand-source-and-generation-load-record:p1:inst-return-record
  if (errors.length > 0) throw new Error(`brand.json: ${errors.join('; ')}`);
  return json;
  // @cpt-end:cpt-template-site-brand-algo-brand-source-and-generation-load-record:p1:inst-return-record
}

/** The custom-property declarations of a stylesheet by normalized selector; comments are dropped and a repeated selector merges. */
export function declarationsBySelector(css: string): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const [, selector, body] of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const key = selector.replace(/\s+/g, ' ').trim();
    out[key] ??= {};
    for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[key][name] = value.trim();
  }
  return out;
}

// @cpt-algo:cpt-template-site-brand-algo-brand-source-and-generation-read-kit:p1
/** The kit's light and dark palettes and every name it declares. */
export function readKit(css: string): Kit {
  // @cpt-begin:cpt-template-site-brand-algo-brand-source-and-generation-read-kit:p1:inst-kit-blocks
  const blocks = declarationsBySelector(css);
  const light = blocks[KIT_LIGHT_SELECTOR];
  const dark = blocks[KIT_DARK_SELECTOR];
  if (!light || !dark) throw new Error(`the kit stylesheet lacks the ${!light ? KIT_LIGHT_SELECTOR : KIT_DARK_SELECTOR} block`);
  // @cpt-end:cpt-template-site-brand-algo-brand-source-and-generation-read-kit:p1:inst-kit-blocks
  // @cpt-begin:cpt-template-site-brand-algo-brand-source-and-generation-read-kit:p1:inst-kit-names
  const names = new Set(Object.values(blocks).flatMap((block) => Object.keys(block)));
  return { light, dark, names };
  // @cpt-end:cpt-template-site-brand-algo-brand-source-and-generation-read-kit:p1:inst-kit-names
}

/** Every row of the record with the section it sits in. */
export function allRows(brand: Brand): { section: string; row: BrandRow }[] {
  return [
    ...brand.light.overrides.map((row) => ({ section: 'light.overrides', row })),
    ...brand.light.tokens.map((row) => ({ section: 'light.tokens', row })),
    ...brand.dark.tokens.map((row) => ({ section: 'dark.tokens', row })),
    ...brand.invariant.map((row) => ({ section: 'invariant', row })),
  ];
}

/** The names the brand owns: its own tokens and the kit tokens it overrides with an adopted value. */
export function brandNames(brand: Brand): Set<string> {
  return new Set([...brand.light.overrides.filter((row) => row.value !== null), ...brand.light.tokens, ...brand.invariant].map((row) => row.token));
}
