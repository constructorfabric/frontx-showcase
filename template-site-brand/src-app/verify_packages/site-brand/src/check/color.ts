/**
 * Colour arithmetic of the brand check: hex normalisation, `var()` and `color-mix(in oklab, ...)` resolution over a palette, and the WCAG contrast ratio.
 */

type Rgb = readonly [number, number, number];

/** A hex colour as lower-case `#rrggbb`, or undefined when the value is not a 3 or 6 digit hex colour. */
export function normalizeHex(value: string): string | undefined {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!match) return undefined;
  const digits = match[1].toLowerCase();
  return digits.length === 3 ? `#${[...digits].map((digit) => digit + digit).join('')}` : `#${digits}`;
}

const toRgb = (hex: string): Rgb => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16)) as unknown as Rgb;
const toLinear = (channel: number) => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const fromLinear = (c: number) => Math.max(0, Math.min(255, Math.round((c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055) * 255)));

// @cpt-algo:cpt-template-site-brand-algo-brand-check-resolve-colour:p1
function toOklab(hex: string): Rgb {
  // @cpt-begin:cpt-template-site-brand-algo-brand-check-resolve-colour:p1:inst-mix-oklab
  const [r, g, b] = toRgb(hex).map(toLinear);
  const [l, m, s] = [0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b, 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b, 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b].map(Math.cbrt);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
  // @cpt-end:cpt-template-site-brand-algo-brand-check-resolve-colour:p1:inst-mix-oklab
}

function fromOklab([lightness, a, b]: Rgb): string {
  // @cpt-begin:cpt-template-site-brand-algo-brand-check-resolve-colour:p1:inst-mix-oklab
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  return `#${rgb.map((c) => fromLinear(c).toString(16).padStart(2, '0')).join('')}`;
  // @cpt-end:cpt-template-site-brand-algo-brand-check-resolve-colour:p1:inst-mix-oklab
}

/** `color-mix(in oklab, a <share>, b)` of two `#rrggbb` colours, `share` in 0..1. */
export function mixOklab(a: string, b: string, share: number): string {
  // @cpt-begin:cpt-template-site-brand-algo-brand-check-resolve-colour:p1:inst-mix-oklab
  const [x, y] = [toOklab(a), toOklab(b)];
  return fromOklab(x.map((channel, index) => channel * share + y[index] * (1 - share)) as unknown as Rgb);
  // @cpt-end:cpt-template-site-brand-algo-brand-check-resolve-colour:p1:inst-mix-oklab
}

/** Splits the arguments of a CSS function at its top-level commas. */
function splitArguments(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '(') depth += 1;
    else if (text[index] === ')') depth -= 1;
    else if (text[index] === ',' && depth === 0) {
      parts.push(text.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts;
}

/**
 * The `#rrggbb` a colour value resolves to over `palette` (token name to value): a hex colour, `var(--name)` of a palette token, or `color-mix(in oklab, <a> [p%], <b> [q%])` of two such values. Throws on anything else, a missing token or a reference cycle, so that a pair is never passed unchecked.
 */
export function resolveColor(value: string, palette: Readonly<Record<string, string>>, seen: readonly string[] = []): string {
  const text = value.trim();
  // @cpt-begin:cpt-template-site-brand-algo-brand-check-resolve-colour:p1:inst-resolve-hex
  const hex = normalizeHex(text);
  if (hex) return hex;
  // @cpt-end:cpt-template-site-brand-algo-brand-check-resolve-colour:p1:inst-resolve-hex
  // @cpt-begin:cpt-template-site-brand-algo-brand-check-resolve-colour:p1:inst-resolve-var
  const reference = /^var\(\s*(--[\w-]+)\s*\)$/.exec(text);
  if (reference) {
    const name = reference[1];
    if (seen.includes(name)) throw new Error(`cycle through ${[...seen, name].join(' -> ')}`);
    if (!(name in palette)) throw new Error(`${name} has no value`);
    return resolveColor(palette[name], palette, [...seen, name]);
  }
  // @cpt-end:cpt-template-site-brand-algo-brand-check-resolve-colour:p1:inst-resolve-var
  // @cpt-begin:cpt-template-site-brand-algo-brand-check-resolve-colour:p1:inst-resolve-mix
  const mix = /^color-mix\(\s*in\s+oklab\s*,([\s\S]*)\)$/.exec(text);
  if (mix) {
    const operands = splitArguments(mix[1]).map((part) => {
      const share = /\s(\d+(?:\.\d+)?)%$/.exec(part);
      return { color: resolveColor(share ? part.slice(0, share.index) : part, palette, seen), share: share ? Number(share[1]) / 100 : undefined };
    });
    if (operands.length !== 2) throw new Error(`cannot resolve ${text}: color-mix takes two colours`);
    const [a, b] = operands;
    const share = a.share ?? (b.share === undefined ? 0.5 : 1 - b.share);
    return mixOklab(a.color, b.color, share);
  }
  throw new Error(`cannot resolve ${text}`);
  // @cpt-end:cpt-template-site-brand-algo-brand-check-resolve-colour:p1:inst-resolve-mix
}

/** The WCAG 2 contrast ratio of two `#rrggbb` colours. */
export function contrast(a: string, b: string): number {
  // @cpt-begin:cpt-template-site-brand-algo-brand-check-resolve-colour:p1:inst-contrast
  const luminance = (hex: string) => {
    const [r, g, bl] = toRgb(hex).map(toLinear);
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
  // @cpt-end:cpt-template-site-brand-algo-brand-check-resolve-colour:p1:inst-contrast
}
