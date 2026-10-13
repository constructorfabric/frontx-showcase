// The rules of the "no CSS in compositions" part of `policy:own-styles` (architecture/DESIGN.md section 4.2.2): which class a styled file belongs to, what a block or shell chrome stylesheet may declare without an exemptions ledger row, what a composition may not do, where a colour literal may stand, and when a ledger row is stale. The policy walk in policy-own-styles.mjs applies them to the repository.
import path from 'node:path';

/**
 * Where blocks live and which ledger holds the exemptions of their stylesheets. `base` is the folder a ledger row's `file` is relative to.
 * @type {Array<{ root: string, ledger: string, base: string }>}
 */
// @cpt-begin:cpt-site-algo-repository-policies-classify-file:p3:inst-if-block
export const BLOCK_SCOPES = [
  { root: 'template-site-blocks/src-app/verify_packages/site-blocks/src/blocks/', ledger: 'template-site-blocks/src-app/verify_packages/site-blocks/styles-exemptions.json', base: 'template-site-blocks/src-app/verify_packages/site-blocks/' },
  { root: 'template-inbox/src-app/mfe_packages/shared/inbox/blocks/', ledger: 'template-inbox/src-app/mfe_packages/shared/inbox/blocks/styles-exemptions.json', base: 'template-inbox/src-app/mfe_packages/shared/inbox/blocks/' },
  { root: 'template-mfe-demo/src-app/mfe_packages/demo-mfe/src/blocks/', ledger: 'template-mfe-demo/src-app/mfe_packages/demo-mfe/src/blocks/styles-exemptions.json', base: 'template-mfe-demo/src-app/mfe_packages/demo-mfe/src/blocks/' },
  { root: 'template-catalogue/src-app/mfe_packages/catalogue-mfe/src/blocks/', ledger: 'template-catalogue/src-app/mfe_packages/catalogue-mfe/src/blocks/styles-exemptions.json', base: 'template-catalogue/src-app/mfe_packages/catalogue-mfe/src/blocks/' },
];
// @cpt-end:cpt-site-algo-repository-policies-classify-file:p3:inst-if-block

/** The shell chrome (layout, the screen container, the document styles) and its one ledger, whose rows are relative to `layout/`. */
// @cpt-begin:cpt-site-algo-repository-policies-classify-file:p3:inst-if-chrome
export const CHROME_SCOPE = {
  roots: ['site/src-app/app/layout/', 'site/src-app/app/mfe/'],
  files: ['site/src-app/app/globals.css'],
  ledger: 'site/src-app/app/layout/styles-exemptions.json',
  base: 'site/src-app/app/layout/',
};
// @cpt-end:cpt-site-algo-repository-policies-classify-file:p3:inst-if-chrome

/**
 * Screen frames: the element a screen's lifecycle renders into, outside a blocks folder. They follow the block rules with no ledger, so every declaration in them is layout on tokens.
 */
// @cpt-begin:cpt-site-algo-repository-policies-classify-file:p3:inst-if-block
export const FRAME_PATHS = [
  'template-inbox/src-app/mfe_packages/shared/inbox/lifecycle/frame.module.css',
  'template-inbox/src-app/mfe_packages/shared/inbox/lifecycle/InboxScreenFrame.tsx',
  'template-calendar-demo/src-app/mfe_packages/calendar-demo-mfe/src/shared/ScreenFrame.module.css',
  'template-calendar-demo/src-app/mfe_packages/calendar-demo-mfe/src/shared/ScreenFrame.tsx',
];
// @cpt-end:cpt-site-algo-repository-policies-classify-file:p3:inst-if-block

// @cpt-begin:cpt-site-algo-repository-policies-classify-file:p3:inst-if-own-rules
const KIT_CANDIDATES_ROOT = 'template-kit-candidates/src-app/verify_packages/kit-candidates/src/';
const BRAND_ROOT = 'template-site-brand/src-app/verify_packages/site-brand/src/';
/** The blocks' layout tokens (the page column, section rhythms, heading row) and the document entry that imports them. */
export const LAYOUT_TOKENS_FILE = 'template-site-blocks/src-app/verify_packages/site-blocks/src/layout.css';
const LAYOUT_TOKEN_FILES = [LAYOUT_TOKENS_FILE, 'template-site-blocks/src-app/verify_packages/site-blocks/src/document.css'];
// @cpt-end:cpt-site-algo-repository-policies-classify-file:p3:inst-if-own-rules

/** The shell's document entries and the stylesheets each may import: template-shell's entry imports the kit theme and the document styles once; the glob convention of ADR 0009 loads every template package's `src/document.css`. */
// @cpt-begin:cpt-site-algo-repository-policies-check-composition:p3:inst-stylesheet-imports
export const DOCUMENT_ENTRIES = new Map([
  ['site/src-app/app/main.tsx', ['@gears-frontx/ui-kit/theme.css', './globals.css']],
  ['site/src-app/app/documentEntries.ts', ['../verify_packages/*/src/document.css']],
]);

/** The kit theme a screen anchors on its shadow host, and the helper whose callers and tests may import it. */
const KIT_THEME_INLINE = '@gears-frontx/ui-kit/theme.css?inline';
const THEME_HELPER = /\banchorKitThemeOnShadowHost\b/;
// @cpt-end:cpt-site-algo-repository-policies-check-composition:p3:inst-stylesheet-imports

/** A colour literal may stand only in the brand record, the files generated from it, and the art palettes (held by the brand's own palette test). */
// @cpt-begin:cpt-site-algo-repository-policies-check-colours:p3:inst-if-colour-source
const COLOUR_SOURCES = [`${BRAND_ROOT}brand.json`, `${BRAND_ROOT}tokens.css`, `${BRAND_ROOT}theme.ts`];
const ART_STYLESHEET = new RegExp(`^${BRAND_ROOT.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}art/[^/]+\\.module\\.css$`);
// @cpt-end:cpt-site-algo-repository-policies-check-colours:p3:inst-if-colour-source

// @cpt-begin:cpt-site-algo-repository-policies-classify-file:p3:inst-if-test
const TEST_FILE = /(?:^|\/)(?:[^/]+\.test\.[cm]?[jt]sx?|test-support\/.+)$/;
// @cpt-end:cpt-site-algo-repository-policies-classify-file:p3:inst-if-test

/**
 * The class of a repository-relative file under the styling rules, and for a block or chrome file its ledger and its key in that ledger.
 * @param {string} relativePath - `/` separators
 * @returns {{ kind: 'kit-candidate' | 'brand' | 'layout-tokens' | 'block' | 'frame' | 'chrome' | 'test' | 'composition', ledger?: string | null, key?: string | null }}
 */
// @cpt-algo:cpt-site-algo-repository-policies-classify-file:p3
export function classifyFile(relativePath) {
  // @cpt-begin:cpt-site-algo-repository-policies-classify-file:p3:inst-if-test
  if (TEST_FILE.test(relativePath)) return { kind: 'test' };
  // @cpt-end:cpt-site-algo-repository-policies-classify-file:p3:inst-if-test
  // @cpt-begin:cpt-site-algo-repository-policies-classify-file:p3:inst-if-own-rules
  if (relativePath.startsWith(KIT_CANDIDATES_ROOT)) return { kind: 'kit-candidate' };
  if (relativePath.startsWith(BRAND_ROOT)) return { kind: 'brand' };
  if (LAYOUT_TOKEN_FILES.includes(relativePath)) return { kind: 'layout-tokens' };
  // @cpt-end:cpt-site-algo-repository-policies-classify-file:p3:inst-if-own-rules
  // @cpt-begin:cpt-site-algo-repository-policies-classify-file:p3:inst-if-block
  for (const scope of BLOCK_SCOPES) {
    if (relativePath.startsWith(scope.root)) return { kind: 'block', ledger: scope.ledger, key: path.posix.relative(scope.base, relativePath) };
  }
  if (FRAME_PATHS.includes(relativePath)) return { kind: 'frame', ledger: null, key: null };
  // @cpt-end:cpt-site-algo-repository-policies-classify-file:p3:inst-if-block
  // @cpt-begin:cpt-site-algo-repository-policies-classify-file:p3:inst-if-chrome
  if (CHROME_SCOPE.files.includes(relativePath) || CHROME_SCOPE.roots.some((root) => relativePath.startsWith(root))) {
    return { kind: 'chrome', ledger: CHROME_SCOPE.ledger, key: path.posix.relative(CHROME_SCOPE.base, relativePath) };
  }
  // @cpt-end:cpt-site-algo-repository-policies-classify-file:p3:inst-if-chrome
  // @cpt-begin:cpt-site-algo-repository-policies-classify-file:p3:inst-else-composition
  return { kind: 'composition' };
  // @cpt-end:cpt-site-algo-repository-policies-classify-file:p3:inst-else-composition
}

/** The text with every CSS comment replaced by spaces, line breaks kept, so offsets and lines stay true. */
function blankCssComments(text) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration
  return text.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));
  // @cpt-end:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration
}

/** The index of the brace closing the one opened at `open`, quotes and nested braces skipped. */
function closingBrace(text, open) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration
  let depth = 0;
  let quote = '';
  for (let index = open; index < text.length; index += 1) {
    const char = text[index];
    if (quote) {
      if (char === '\\') index += 1;
      else if (char === quote) quote = '';
    } else if (char === '"' || char === "'") quote = char;
    else if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return text.length;
  // @cpt-end:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration
}

/** Splits at a separator outside parentheses and quotes. */
function splitTopLevel(text, separator) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration
  const parts = [];
  let depth = 0;
  let quote = '';
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quote) {
      if (char === '\\') index += 1;
      else if (char === quote) quote = '';
    } else if (char === '"' || char === "'") quote = char;
    else if (char === '(') depth += 1;
    else if (char === ')') depth -= 1;
    else if (char === separator && depth === 0) {
      parts.push({ text: text.slice(start, index), offset: start });
      start = index + 1;
    }
  }
  parts.push({ text: text.slice(start), offset: start });
  return parts;
  // @cpt-end:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration
}

/** A selector list as one comparable string: each selector trimmed, whitespace collapsed, joined by ", ". */
export function normalizeSelector(selector) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration
  return splitTopLevel(selector, ',')
    .map((part) => part.text.trim().replace(/\s+/g, ' '))
    .join(', ');
  // @cpt-end:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration
}

/**
 * Every declaration of a stylesheet with its rule's selector and its own line; at-rule blocks (media, container, supports) are entered, their condition is not part of the selector.
 * @param {string} text
 * @returns {Array<{ selector: string, property: string, value: string, line: number }>}
 */
export function cssDeclarations(text) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration
  const source = blankCssComments(text);
  const lineAt = (offset) => source.slice(0, offset).split('\n').length;
  /** @type {Array<{ selector: string, property: string, value: string, line: number }>} */
  const found = [];
  const walk = (start, end) => {
    let preludeStart = start;
    for (let index = start; index < end; index += 1) {
      const char = source[index];
      if (char === ';') preludeStart = index + 1;
      else if (char === '}') preludeStart = index + 1;
      else if (char === '{') {
        const prelude = source.slice(preludeStart, index).trim();
        const close = closingBrace(source, index);
        if (prelude.startsWith('@')) walk(index + 1, close);
        else {
          const selector = normalizeSelector(prelude);
          for (const part of splitTopLevel(source.slice(index + 1, close), ';')) {
            const colon = part.text.indexOf(':');
            if (colon < 0 || !part.text.trim()) continue;
            const property = part.text.slice(0, colon).trim();
            const value = part.text.slice(colon + 1).trim().replace(/\s+/g, ' ');
            const leading = part.text.length - part.text.trimStart().length;
            found.push({ selector, property, value, line: lineAt(index + 1 + part.offset + leading) });
          }
        }
        index = close;
        preludeStart = close + 1;
      }
    }
  };
  walk(0, source.length);
  return found;
  // @cpt-end:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration
}

/** Layout properties: the box, its position, flex and grid arrangement, overflow, containment, scroll margins and the list marker reset. A custom property is a layout property only when it is a layout custom property (see isLayoutDeclaration). */
// @cpt-begin:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration
const LAYOUT_PROPERTY = new RegExp(
  '^(?:' +
    [
      'display',
      'position',
      'inset(?:-(?:inline|block)(?:-(?:start|end))?)?',
      'top|right|bottom|left',
      'z-index',
      'box-sizing',
      '(?:min-|max-)?(?:width|height|inline-size|block-size)',
      'aspect-ratio',
      '(?:margin|padding)(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?',
      'gap|row-gap|column-gap',
      'grid(?:-(?:template(?:-(?:columns|rows|areas))?|area|column|row|(?:column|row)-(?:start|end)|auto-(?:flow|columns|rows)))?',
      'flex(?:-(?:direction|wrap|flow|grow|shrink|basis))?',
      'order',
      '(?:align|justify|place)-(?:items|content|self)',
      'overflow(?:-(?:x|y|inline|block))?',
      'container(?:-(?:type|name))?',
      'contain',
      'scroll-(?:margin|padding)(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?',
      'list-style',
      '--[A-Za-z0-9_-]+',
    ].join('|') +
    ')$'
);

const VALUE_FUNCTIONS = new Set(['calc', 'min', 'max', 'clamp', 'minmax', 'repeat', 'fit-content']);
// @cpt-end:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration

/**
 * Whether a value is made of tokens (`var(--x)`, a fallback judged the same way), keywords, unitless numbers, `0`, percentages, `fr` and strings, combined by the layout functions.
 * @param {string} value
 */
function isLayoutValue(value) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration
  const text = value.replace(/!important\s*$/, '').trim();
  let index = 0;
  const parseList = (closer) => {
    while (index < text.length) {
      const rest = text.slice(index);
      if (closer && rest.startsWith(closer)) return true;
      const space = /^[\s,/*+-](?=[\s\d.(a-z-]|$)|^[\s,/*]/i.exec(rest);
      if (space) {
        index += space[0].length;
        continue;
      }
      const string = /^"[^"]*"|^'[^']*'/.exec(rest);
      if (string) {
        index += string[0].length;
        continue;
      }
      const call = /^([a-z-]+)\(/i.exec(rest);
      if (call) {
        const name = call[1].toLowerCase();
        index += call[0].length;
        if (name === 'var') {
          const custom = /^\s*--[A-Za-z0-9_-]+\s*/.exec(text.slice(index));
          if (!custom) return false;
          index += custom[0].length;
          if (text[index] === ',') {
            index += 1;
            if (!parseList(')')) return false;
          }
        } else if (!VALUE_FUNCTIONS.has(name) || !parseList(')')) return false;
        if (text[index] !== ')') return false;
        index += 1;
        continue;
      }
      const number = /^-?(?:\d+\.?\d*|\.\d+)(%|fr)?(?![a-z])/i.exec(rest);
      if (number) {
        index += number[0].length;
        continue;
      }
      const keyword = /^-?[a-z][a-z0-9-]*(?![(\w])/i.exec(rest);
      if (keyword) {
        index += keyword[0].length;
        continue;
      }
      return false;
    }
    return !closer;
  };
  return parseList('');
  // @cpt-end:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration
}

/** The kit's own layout hooks a block may set: the spacing a kit `Card` pads its parts with. */
// @cpt-begin:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration
export const KIT_LAYOUT_HOOKS = ['--card-spacing'];
// @cpt-end:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration

/**
 * Whether a declaration is layout on tokens: an allow-listed layout property whose value passes the value rule. A custom property counts as a layout property only when it is a layout custom property: one of the blocks' layout tokens, a property a block or chrome stylesheet reads (a block-local value or a frame block's arrangement hook), or a kit layout hook; one that sets a hook only the kit, a kit candidate or the brand reads (a button's colours, the type ramp's `--text-*`) is not layout.
 * @param {string} property
 * @param {string} value
 * @param {Set<string>} [layoutCustom] - custom property names that are layout here
 */
export function isLayoutDeclaration(property, value, layoutCustom = new Set()) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration
  if (property.startsWith('--') && !layoutCustom.has(property)) return false;
  return LAYOUT_PROPERTY.test(property) && isLayoutValue(value);
  // @cpt-end:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration
}

/**
 * The custom property names a stylesheet reads with `var()`: its block-local layout properties.
 * @param {string} text
 */
export function customPropertiesRead(text) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration
  return new Set([...blankCssComments(text).matchAll(/var\(\s*(--[A-Za-z0-9_-]+)/g)].map((match) => match[1]));
  // @cpt-end:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration
}

/**
 * The custom property names the blocks' layout tokens file declares.
 * @param {string} text
 */
export function layoutTokenNames(text) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration
  return new Set(cssDeclarations(text).filter(({ property }) => property.startsWith('--')).map(({ property }) => property));
  // @cpt-end:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration
}

/**
 * The rows of an exemptions ledger, whichever shape it was written in: `rows` or `exemptions`, a `file` or a catalogue `block`, one property or several separated by commas, the reason in `waitsFor`, `reason` or `gap`.
 * @param {any} ledger - the parsed JSON
 * @returns {Array<{ file: string, selector: string, properties: string[], reason: string }>}
 */
export function normalizeLedger(ledger) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-ledger:p3:inst-for-each-row
  const rows = Array.isArray(ledger?.rows) ? ledger.rows : Array.isArray(ledger?.exemptions) ? ledger.exemptions : [];
  return rows.map((row) => ({
    file: typeof row.file === 'string' ? row.file : `${row.block}/${row.block}.module.css`,
    selector: normalizeSelector(String(row.selector ?? '')),
    properties: String(row.property ?? '')
      .split(',')
      .map((property) => property.trim())
      .filter(Boolean),
    reason: [row.waitsFor, row.reason, row.gap].find((text) => typeof text === 'string' && text.trim() !== '' && text.trim() !== 'none') ?? '',
  }));
  // @cpt-end:cpt-site-algo-repository-policies-check-ledger:p3:inst-for-each-row
}

/**
 * The declarations of a block, frame or shell chrome stylesheet that are not layout on tokens and that no row of its ledger covers.
 * @param {string} relativePath
 * @param {string} text
 * @param {{ key: string | null, rows: Array<{ file: string, selector: string, properties: string[] }> }} ledger
 * @param {Set<string>} [layoutCustom] - the layout custom properties: the blocks' layout tokens and every name a block or chrome stylesheet reads
 */
// @cpt-algo:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3
export function checkRuledStylesheet(relativePath, text, ledger, layoutCustom = new Set()) {
  const errors = [];
  // @cpt-begin:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration
  const custom = new Set([...layoutCustom, ...KIT_LAYOUT_HOOKS, ...customPropertiesRead(text)]);
  for (const { selector, property, value, line } of cssDeclarations(text)) {
    if (isLayoutDeclaration(property, value, custom)) continue;
    // @cpt-end:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-for-each-declaration
    // @cpt-begin:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-if-covered
    const covered = ledger.key !== null && ledger.rows.some((row) => row.file === ledger.key && row.selector === selector && row.properties.includes(property));
    if (!covered) errors.push(`${relativePath}:${line}: ${selector} { ${property}: ${value} } is not layout on tokens and no row of its exemptions ledger covers it`);
    // @cpt-end:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-if-covered
  }
  // @cpt-begin:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-return-ruled
  return errors;
  // @cpt-end:cpt-site-algo-repository-policies-check-ruled-stylesheet:p3:inst-return-ruled
}

/**
 * Stale and unreasoned rows of one ledger.
 * @param {string} ledgerPath - for the messages
 * @param {Array<{ file: string, selector: string, properties: string[], reason: string }>} rows
 * @param {(file: string) => string | undefined} readFile - a row's file text, undefined when it does not exist
 */
// @cpt-algo:cpt-site-algo-repository-policies-check-ledger:p3
export function checkLedgerRows(ledgerPath, rows, readFile) {
  const errors = [];
  /** @type {Map<string, ReturnType<typeof cssDeclarations> | null>} */
  const parsed = new Map();
  // @cpt-begin:cpt-site-algo-repository-policies-check-ledger:p3:inst-for-each-row
  rows.forEach((row, index) => {
    const at = `${ledgerPath}: row ${index + 1} (${row.file} ${row.selector})`;
    if (!parsed.has(row.file)) {
      const text = readFile(row.file);
      parsed.set(row.file, text === undefined ? null : /\.css$/.test(row.file) ? cssDeclarations(text) : []);
    }
    const declarations = parsed.get(row.file);
    // @cpt-end:cpt-site-algo-repository-policies-check-ledger:p3:inst-for-each-row
    // @cpt-begin:cpt-site-algo-repository-policies-check-ledger:p3:inst-if-stale
    if (!declarations) errors.push(`${at} names a file that does not exist`);
    else if (!/\.css$/.test(row.file)) {
      // A row on a block script records an inline style the script sets on a CSS Module class: the class and each property must still be there.
      const text = readFile(row.file) ?? '';
      const classes = [...row.selector.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((match) => match[1]);
      if (classes.length === 0 || classes.some((name) => !new RegExp(`styles(?:\\.${name}\\b|\\[['"]${name}['"]\\])`).test(text))) errors.push(`${at} names a selector its file no longer has`);
      else for (const property of row.properties) if (!new RegExp(`\\b${property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())}\\s*:`).test(text)) errors.push(`${at} names ${property}, which the rule no longer declares`);
    } else {
      const rule = declarations.filter((declaration) => declaration.selector === row.selector);
      if (rule.length === 0) errors.push(`${at} names a selector its file no longer has`);
      else
        for (const property of row.properties) if (!rule.some((declaration) => declaration.property === property)) errors.push(`${at} names ${property}, which the rule no longer declares`);
    }
    // @cpt-end:cpt-site-algo-repository-policies-check-ledger:p3:inst-if-stale
    // @cpt-begin:cpt-site-algo-repository-policies-check-ledger:p3:inst-if-no-reason
    if (!row.reason.trim()) errors.push(`${at} names no kit gap or defect it waits for`);
    // @cpt-end:cpt-site-algo-repository-policies-check-ledger:p3:inst-if-no-reason
  });
  // @cpt-begin:cpt-site-algo-repository-policies-check-ledger:p3:inst-return-ledger
  return errors;
  // @cpt-end:cpt-site-algo-repository-policies-check-ledger:p3:inst-return-ledger
}

/**
 * The blocks' layout tokens file declares custom properties only.
 * @param {string} relativePath
 * @param {string} text
 */
export function checkLayoutTokens(relativePath, text) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-layers:p3:inst-if-ruled
  return cssDeclarations(text)
    .filter(({ property }) => !property.startsWith('--'))
    .map(({ selector, property, value, line }) => `${relativePath}:${line}: ${selector} { ${property}: ${value} } is not a layout token; the layout tokens file declares custom properties only`);
  // @cpt-end:cpt-site-algo-repository-policies-check-layers:p3:inst-if-ruled
}

/** Script text with comments blanked (line breaks kept); a `//` inside a quoted URL is left alone. */
function blankScriptComments(text) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-composition:p3:inst-stylesheet-imports
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:'"`\\])\/\/[^\n]*/g, (match, before) => before + ' '.repeat(match.length - before.length));
  // @cpt-end:cpt-site-algo-repository-policies-check-composition:p3:inst-stylesheet-imports
}

// @cpt-begin:cpt-site-algo-repository-policies-check-composition:p3:inst-stylesheet-imports
const STYLESHEET_SPECIFIER = /\.css(?:\?[^'"`]*)?$/;
// `import x from '...'`, `import '...'`, `import('...')`, `require('...')`.
const MODULE_SPECIFIER = /(?:\bimport\s+(?:[\w$*{}\s,]+?\s+from\s+)?|\bimport\s*\(\s*|\brequire\s*\(\s*)(['"`])([^'"`]+)\1/g;
const GLOB_CALL = /\bimport\.meta\.glob(?:Eager)?\s*(?:<[^>]*>)?\s*\(/g;
const QUOTED = /(['"`])([^'"`]+)\1/g;
// @cpt-end:cpt-site-algo-repository-policies-check-composition:p3:inst-stylesheet-imports

/** The argument text of the call whose opening parenthesis ends at `start`, up to its balanced closing parenthesis. */
function balanced(text, start, open = '(', close = ')') {
  // @cpt-begin:cpt-site-algo-repository-policies-check-composition:p3:inst-stylesheet-imports
  let depth = 1;
  let quote = '';
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quote) {
      if (char === '\\') index += 1;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === "'" || char === '"' || char === '`') quote = char;
    else if (char === open) depth += 1;
    else if (char === close) {
      depth -= 1;
      if (depth === 0) return text.slice(start, index);
    }
  }
  return text.slice(start);
  // @cpt-end:cpt-site-algo-repository-policies-check-composition:p3:inst-stylesheet-imports
}

/**
 * A composition's violations: a stylesheet import (beyond the kit theme anchored by the theme helper and the shell's document entries), a `style` prop, a className that is neither a kit variants call nor the component's own forwarded className.
 * @param {string} relativePath
 * @param {string} text
 */
// @cpt-algo:cpt-site-algo-repository-policies-check-composition:p3
export function checkComposition(relativePath, text) {
  const errors = [];
  const source = blankScriptComments(text);
  const lineAt = (offset) => source.slice(0, offset).split('\n').length;
  // @cpt-begin:cpt-site-algo-repository-policies-check-composition:p3:inst-stylesheet-imports
  const allowed = new Set(DOCUMENT_ENTRIES.get(relativePath) ?? []);
  if (THEME_HELPER.test(source)) allowed.add(KIT_THEME_INLINE);
  const specifiers = [];
  for (const match of source.matchAll(MODULE_SPECIFIER)) specifiers.push({ specifier: match[2], offset: match.index ?? 0 });
  for (const call of source.matchAll(GLOB_CALL)) {
    const start = (call.index ?? 0) + call[0].length;
    for (const literal of balanced(source, start).matchAll(QUOTED)) specifiers.push({ specifier: literal[2], offset: call.index ?? 0 });
  }
  for (const { specifier, offset } of specifiers) {
    if (STYLESHEET_SPECIFIER.test(specifier) && !allowed.has(specifier)) errors.push(`${relativePath}:${lineAt(offset)}: imports a stylesheet (${specifier}); a composition carries no CSS, its arrangement belongs to a block`);
  }
  // @cpt-end:cpt-site-algo-repository-policies-check-composition:p3:inst-stylesheet-imports
  // @cpt-begin:cpt-site-algo-repository-policies-check-composition:p3:inst-style-props
  if (/\.[jt]sx$/.test(relativePath)) {
    for (const match of source.matchAll(/\bstyle\s*=\s*\{/g)) errors.push(`${relativePath}:${lineAt(match.index ?? 0)}: passes a style prop; a composition carries no CSS`);
    for (const match of source.matchAll(/\bclassName\s*=\s*\{/g)) {
      const expression = balanced(source, (match.index ?? 0) + match[0].length, '{', '}').trim();
      const kitVariants = /^[A-Za-z_$][\w$]*Variants\s*\(/.test(expression) && expression.endsWith(')');
      if (!kitVariants && !/^(?:props\.)?className$/.test(expression)) errors.push(`${relativePath}:${lineAt(match.index ?? 0)}: passes a className (${expression.replace(/\s+/g, ' ')}) that is neither a kit variants call nor its own forwarded className`);
    }
  }
  // @cpt-end:cpt-site-algo-repository-policies-check-composition:p3:inst-style-props
  // @cpt-begin:cpt-site-algo-repository-policies-check-composition:p3:inst-return-composition
  return errors;
  // @cpt-end:cpt-site-algo-repository-policies-check-composition:p3:inst-return-composition
}

// A hex colour in a stylesheet value: 3, 4, 6 or 8 digits.
// @cpt-begin:cpt-site-algo-repository-policies-check-colours:p3:inst-find-colours
const CSS_HEX = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![0-9a-z_-])/gi;
// A hex colour inside a script string: 3, 6 or 8 digits after the string start, a space, a parenthesis, a comma or a colon (an order number such as '#1001' is data, not a colour).
const SCRIPT_HEX = /(?<=^|[\s(,:])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3})(?![0-9a-z_-])/gi;
const SCRIPT_STRING = /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g;
// @cpt-end:cpt-site-algo-repository-policies-check-colours:p3:inst-find-colours

/**
 * Hex colour literals outside the brand record, its generated files and the art palettes. In a stylesheet only declaration values count (an id selector is not a colour) and a mask's stops are alpha, not colour; in a script only string contents count, comments not.
 * @param {string} relativePath
 * @param {string} text
 */
// @cpt-algo:cpt-site-algo-repository-policies-check-colours:p3
export function checkColourLiterals(relativePath, text) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-colours:p3:inst-if-colour-source
  if (COLOUR_SOURCES.includes(relativePath) || ART_STYLESHEET.test(relativePath) || classifyFile(relativePath).kind === 'test') return [];
  // @cpt-end:cpt-site-algo-repository-policies-check-colours:p3:inst-if-colour-source
  const errors = [];
  const ext = path.posix.extname(relativePath);
  // @cpt-begin:cpt-site-algo-repository-policies-check-colours:p3:inst-find-colours
  if (ext === '.css') {
    for (const { property, value, line } of cssDeclarations(text)) {
      if (/mask/.test(property)) continue;
      for (const hex of value.matchAll(CSS_HEX)) errors.push(`${relativePath}:${line}: colour literal ${hex[0]}; a colour comes from a brand or kit token`);
    }
  } else if (/\.[cm]?[jt]sx?$/.test(ext)) {
    const source = blankScriptComments(text);
    for (const literal of source.matchAll(SCRIPT_STRING)) {
      const body = literal[0].slice(1, -1);
      for (const hex of body.matchAll(SCRIPT_HEX)) {
        const line = source.slice(0, (literal.index ?? 0) + 1 + (hex.index ?? 0)).split('\n').length;
        errors.push(`${relativePath}:${line}: colour literal ${hex[0]}; a colour comes from a brand or kit token`);
      }
    }
  }
  // @cpt-end:cpt-site-algo-repository-policies-check-colours:p3:inst-find-colours
  // @cpt-begin:cpt-site-algo-repository-policies-check-colours:p3:inst-return-colours
  return errors;
  // @cpt-end:cpt-site-algo-repository-policies-check-colours:p3:inst-return-colours
}
