// The art palette rule of ADR 0002, as code the tests run over every art module: a colour literal (hex, rgb, hsl) appears only in the palette blocks at the top of an art stylesheet, a dark palette names the same custom properties as the light one, and no script of the art writes a colour literal.

export interface PaletteFinding {
  file: string;
  message: string;
}

const COLOUR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/;

interface Rule {
  selector: string;
  declarations: Array<{ property: string; value: string }>;
}

/** The top-level rules of a stylesheet in order, at-rules' inner rules flattened after their prelude; comments dropped. */
function rules(css: string): Rule[] {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const found: Rule[] = [];
  const pattern = /([^{}]+)\{([^{}]*)\}/g;
  for (const match of text.matchAll(pattern)) {
    const selector = match[1].trim();
    const declarations = match[2]
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const colon = part.indexOf(':');
        return { property: part.slice(0, colon).trim(), value: part.slice(colon + 1).trim() };
      });
    found.push({ selector, declarations });
  }
  return found;
}

function isPalette(rule: Rule): boolean {
  return rule.declarations.length > 0 && rule.declarations.every((declaration) => declaration.property.startsWith('--'));
}

/** Findings for one art stylesheet. */
export function checkStylesheet(file: string, css: string): PaletteFinding[] {
  const findings: PaletteFinding[] = [];
  const all = rules(css);
  const firstOther = all.findIndex((rule) => !isPalette(rule));
  const palettes = firstOther === -1 ? all : all.slice(0, firstOther);
  if (palettes.length === 0) findings.push({ file, message: 'no palette block at the top of the stylesheet' });
  // Every later palette (a dark palette, or the light one again inside a dark page) switches every colour of the first one, and names nothing the first one lacks.
  const first = palettes[0]?.declarations ?? [];
  const colourKeys = first.filter((declaration) => COLOUR_LITERAL.test(declaration.value)).map((declaration) => declaration.property);
  const firstKeys = new Set(first.map((declaration) => declaration.property));
  for (const palette of palettes.slice(1)) {
    const keys = new Set(palette.declarations.map((declaration) => declaration.property));
    const missing = colourKeys.filter((key) => !keys.has(key));
    const extra = [...keys].filter((key) => !firstKeys.has(key));
    if (missing.length > 0) findings.push({ file, message: `palette "${palette.selector}" does not switch ${missing.join(', ')}` });
    if (extra.length > 0) findings.push({ file, message: `palette "${palette.selector}" declares ${extra.join(', ')}, which the first palette does not` });
  }
  const rest = firstOther === -1 ? [] : all.slice(firstOther);
  for (const rule of rest) {
    for (const declaration of rule.declarations) {
      if (COLOUR_LITERAL.test(declaration.value)) {
        findings.push({ file, message: `colour literal outside the palette: ${rule.selector} { ${declaration.property}: ${declaration.value} }` });
      }
    }
  }
  return findings;
}

/** Findings for one art script: no colour literal in a string or an attribute. */
export function checkScript(file: string, source: string): PaletteFinding[] {
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  return code.split('\n').flatMap((line, index) => {
    const literal = /['"`][^'"`]*(?:#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\()[^'"`]*['"`]/.exec(line);
    return literal ? [{ file, message: `line ${index + 1}: colour literal ${literal[0]}` }] : [];
  });
}
