import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/*
 * The catalogue's styling rules, read from the files themselves: the screen's own stylesheets live in its blocks (`src/blocks/<Block>/`), every other module of the screen is a composition that imports no stylesheet, a block declares layout only, and every other declaration a block keeps is a row of `styles-exemptions.json` naming the kit gap it waits for. The generated demo files (`src/examples/`, `src/pages/`, `src/shared.tsx`) are the kit's own and stay out of these rules.
 */
const blocksDir = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.dirname(blocksDir);
const GENERATED = [path.join(srcDir, 'examples'), path.join(srcDir, 'pages'), path.join(srcDir, 'shared.tsx')];
/** The kit's token sheet, which the lifecycle anchors on the shadow host: the one stylesheet a composition imports. */
const ANCHORED_THEME = "'@gears-frontx/ui-kit/theme.css?inline'";
/** The control text floor of the design checker: the kit's `--text-label-size`. */
const FLOOR_PX = 12;

/** Properties that place and size boxes; anything else a block declares, other than a custom property of its own, needs a ledger row. */
const LAYOUT_PROPERTIES = new Set([
  'display', 'position', 'top', 'right', 'bottom', 'left', 'inset', 'inset-inline', 'inset-inline-start', 'inset-inline-end', 'inset-block', 'z-index',
  'flex', 'flex-direction', 'flex-wrap', 'flex-flow', 'flex-grow', 'flex-shrink', 'flex-basis', 'order',
  'grid', 'grid-template', 'grid-template-columns', 'grid-template-rows', 'grid-template-areas', 'grid-column', 'grid-row', 'grid-area', 'grid-auto-flow', 'grid-auto-rows', 'grid-auto-columns',
  'gap', 'row-gap', 'column-gap',
  'align-items', 'align-self', 'align-content', 'justify-items', 'justify-self', 'justify-content', 'place-items', 'place-self', 'place-content',
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 'inline-size', 'block-size', 'min-inline-size', 'max-inline-size', 'aspect-ratio', 'box-sizing',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'margin-inline', 'margin-inline-start', 'margin-inline-end', 'margin-block', 'margin-block-start', 'margin-block-end',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'padding-inline', 'padding-inline-start', 'padding-inline-end', 'padding-block', 'padding-block-start', 'padding-block-end',
  'overflow', 'overflow-x', 'overflow-y', 'list-style', 'container-type', 'container-name',
]);

interface LedgerRow {
  block: string;
  selector: string;
  property: string;
  waitsFor: string;
  reason: string;
}

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (GENERATED.includes(full)) return [];
    return entry.isDirectory() ? walk(full) : [full];
  });
}

/** Every declaration of a stylesheet with the selector of its innermost rule (a rule inside a media query keeps its own selector). */
function declarations(css: string): Array<{ selector: string; property: string; value: string }> {
  const found: Array<{ selector: string; property: string; value: string }> = [];
  for (const [, selector, body] of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    for (const line of body.split(';')) {
      const colon = line.indexOf(':');
      if (colon < 0) continue;
      found.push({ selector: selector.trim().replace(/\s+/g, ' '), property: line.slice(0, colon).trim(), value: line.slice(colon + 1).trim() });
    }
  }
  return found;
}

const files = walk(srcDir);
const stylesheets = files.filter((file) => file.endsWith('.css'));
const blockSheets = stylesheets.filter((file) => path.relative(blocksDir, file).split(path.sep).length === 2);
const ledger = JSON.parse(fs.readFileSync(path.join(blocksDir, 'styles-exemptions.json'), 'utf8')) as { exemptions: LedgerRow[] };
const blockOf = (file: string) => path.relative(blocksDir, file).split(path.sep)[0] ?? '';

describe('catalogue styles', () => {
  it('keeps every stylesheet of the screen inside a block folder', () => {
    expect(stylesheets.filter((file) => !blockSheets.includes(file)).map((file) => path.relative(srcDir, file))).toEqual([]);
  });

  it('imports no stylesheet in a composition, the anchored kit theme aside', () => {
    const compositions = files.filter((file) => /\.tsx?$/.test(file) && !file.startsWith(blocksDir + path.sep) && !/\.test\.tsx?$/.test(file));
    const offenders = compositions.filter((file) =>
      [...fs.readFileSync(file, 'utf8').matchAll(/import\s+(?:[\w{},\s*]+\s+from\s+)?(['"][^'"]+\.css(?:\?[^'"]*)?['"])/g)].some(([, specifier]) => specifier !== ANCHORED_THEME)
    );
    expect(offenders.map((file) => path.relative(srcDir, file))).toEqual([]);
  });

  it('declares layout only in a block, or names the kit gap a declaration waits for', () => {
    const missing = blockSheets.flatMap((file) =>
      declarations(fs.readFileSync(file, 'utf8'))
        .filter(({ property }) => !LAYOUT_PROPERTIES.has(property) && !property.startsWith('--'))
        .filter(({ selector, property }) => !ledger.exemptions.some((row) => row.block === blockOf(file) && row.selector === selector && row.property === property))
        .map(({ selector, property }) => `${blockOf(file)} ${selector} { ${property} }`)
    );
    expect(missing).toEqual([]);
  });

  it('keeps no ledger row whose declaration is gone, and gives each row its kit gap and reason', () => {
    const declared = new Set(blockSheets.flatMap((file) => declarations(fs.readFileSync(file, 'utf8')).map(({ selector, property }) => `${blockOf(file)}|${selector}|${property}`)));
    expect(ledger.exemptions.filter((row) => !declared.has(`${row.block}|${row.selector}|${row.property}`))).toEqual([]);
    expect(ledger.exemptions.filter((row) => !row.waitsFor.trim() || !row.reason.trim())).toEqual([]);
  });

  it('draws no text under the control text floor', () => {
    const small = stylesheets.flatMap((file) =>
      declarations(fs.readFileSync(file, 'utf8'))
        .filter(({ property, value }) => property === 'font-size' && /^[\d.]+px$/.test(value) && Number.parseFloat(value) < FLOOR_PX)
        .map(({ selector, value }) => `${path.relative(srcDir, file)} ${selector} ${value}`)
    );
    expect(small).toEqual([]);
  });
});
