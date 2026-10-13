import { describe, expect, it } from 'vitest';
import {
  checkColourLiterals,
  checkComposition,
  checkLayoutTokens,
  checkLedgerRows,
  checkRuledStylesheet,
  classifyFile,
  cssDeclarations,
  isLayoutDeclaration,
  normalizeLedger,
} from './style-rules.mjs';

const BLOCKS = 'template-site-blocks/src-app/verify_packages/site-blocks/src/blocks';
const SCREEN = 'template-site/src-app/mfe_packages/site-docs-mfe/src/screens/docs/DocsScreen.tsx';

describe('classifyFile', () => {
  it('names the class of every styled file: kit candidate, brand, layout tokens, block, frame, shell chrome, composition', () => {
    expect(classifyFile('template-kit-candidates/src-app/verify_packages/kit-candidates/src/components/text/Text.module.css').kind).toBe('kit-candidate');
    expect(classifyFile('template-site-brand/src-app/verify_packages/site-brand/src/art/HeroArt.module.css').kind).toBe('brand');
    expect(classifyFile('template-site-blocks/src-app/verify_packages/site-blocks/src/layout.css').kind).toBe('layout-tokens');
    expect(classifyFile(`${BLOCKS}/Facts/Facts.module.css`)).toMatchObject({ kind: 'block', ledger: 'template-site-blocks/src-app/verify_packages/site-blocks/styles-exemptions.json', key: 'src/blocks/Facts/Facts.module.css' });
    expect(classifyFile('template-inbox/src-app/mfe_packages/shared/inbox/blocks/PagePane/PagePane.module.css')).toMatchObject({ kind: 'block', key: 'PagePane/PagePane.module.css' });
    expect(classifyFile('template-mfe-demo/src-app/mfe_packages/demo-mfe/src/blocks/TokenList/TokenList.module.css').kind).toBe('block');
    expect(classifyFile('template-catalogue/src-app/mfe_packages/catalogue-mfe/src/blocks/ListCard/ListCard.module.css')).toMatchObject({ kind: 'block', key: 'ListCard/ListCard.module.css' });
    expect(classifyFile('template-inbox/src-app/mfe_packages/shared/inbox/lifecycle/frame.module.css')).toMatchObject({ kind: 'frame', ledger: null });
    expect(classifyFile('template-calendar-demo/src-app/mfe_packages/calendar-demo-mfe/src/shared/ScreenFrame.tsx').kind).toBe('frame');
    expect(classifyFile('site/src-app/app/layout/ui/HeaderBar.module.css')).toMatchObject({ kind: 'chrome', ledger: 'site/src-app/app/layout/styles-exemptions.json', key: 'ui/HeaderBar.module.css' });
    expect(classifyFile('site/src-app/app/mfe/MfeScreenContainer.module.css')).toMatchObject({ kind: 'chrome', key: '../mfe/MfeScreenContainer.module.css' });
    expect(classifyFile('site/src-app/app/globals.css')).toMatchObject({ kind: 'chrome', key: '../globals.css' });
    expect(classifyFile(SCREEN).kind).toBe('composition');
    expect(classifyFile('template-inbox/src-app/mfe_packages/shared/inbox/lifecycle/InboxScreenLifecycle.tsx').kind).toBe('composition');
    expect(classifyFile('site/src-app/app/main.tsx').kind).toBe('composition');
  });

  it('keeps tests out of the composition rules', () => {
    expect(classifyFile('template-site/src-app/mfe_packages/site-docs-mfe/src/site-theme/anchorKitThemeOnShadowHost.test.ts').kind).toBe('test');
    expect(classifyFile('template-site-blocks/src-app/verify_packages/site-blocks/src/test-support/axe.ts').kind).toBe('test');
  });
});

describe('cssDeclarations', () => {
  it('lists every declaration with its rule selector, inside media and container queries too, without comments', () => {
    const css = '/* a { color: red; } */\n.a,\n.b { display: grid; color: var(--x) }\n@media (max-width: 40rem) {\n  .a { gap: var(--space-2); }\n}\n@container inbox (min-width: 1px) { .c { width: 100%; } }\n';
    expect(cssDeclarations(css)).toEqual([
      { selector: '.a, .b', property: 'display', value: 'grid', line: 3 },
      { selector: '.a, .b', property: 'color', value: 'var(--x)', line: 3 },
      { selector: '.a', property: 'gap', value: 'var(--space-2)', line: 5 },
      { selector: '.c', property: 'width', value: '100%', line: 7 },
    ]);
  });
});

describe('isLayoutDeclaration', () => {
  it('accepts allow-listed layout properties on tokens, keywords, 0, percentages, fr and auto', () => {
    for (const [property, value] of [
      ['display', 'grid'],
      ['gap', 'var(--space-4)'],
      ['grid-template-columns', 'repeat(2, minmax(0, 1fr))'],
      ['padding', '0 var(--space-6)'],
      ['width', '100%'],
      ['margin-inline', 'auto'],
      ['flex', '1 1 0'],
      ['max-width', 'var(--site-lead-column, 100%)'],
      ['inline-size', 'calc(var(--space-8) * 15)'],
      ['grid-template-areas', '"rail body"'],
      ['--site-section-pad-top', 'var(--space-8)'],
      ['--cards-gap', 'var(--space-4)'],
      ['list-style', 'none'],
      ['overflow-x', 'auto'],
    ]) {
      expect([property, value, isLayoutDeclaration(property, value, new Set(['--site-section-pad-top', '--cards-gap']))]).toEqual([property, value, true]);
    }
  });

  it('refuses a non-layout property and a layout property on a length literal', () => {
    for (const [property, value] of [
      ['color', 'var(--foreground)'],
      ['font-size', 'var(--text-body-size)'],
      ['border-bottom', 'var(--border-width) solid var(--border)'],
      ['padding', '28px'],
      ['--card-spacing', '28px'],
      ['min-height', '100vh'],
      ['grid-template-columns', 'repeat(auto-fill, minmax(16rem, 1fr))'],
      ['max-width', 'var(--x, 42rem)'],
    ]) {
      expect([property, value, isLayoutDeclaration(property, value, new Set(['--card-spacing']))]).toEqual([property, value, false]);
    }
  });

  it("refuses a custom property that sets another stylesheet's hook: a kit part's or the type ramp's", () => {
    expect(isLayoutDeclaration('--button-bg', 'var(--background)')).toBe(false);
    expect(isLayoutDeclaration('--text-display-line-height', '1.12')).toBe(false);
  });
});

describe('normalizeLedger', () => {
  it('reads every ledger shape into rows of file, selector, properties and reason', () => {
    expect(normalizeLedger({ rows: [{ file: 'a.css', selector: '.x', property: 'color', waitsFor: 'Kit gap: no tone', gap: 'none' }] })).toEqual([
      { file: 'a.css', selector: '.x', properties: ['color'], reason: 'Kit gap: no tone' },
    ]);
    expect(normalizeLedger({ rows: [{ file: 'b.css', selector: '.y', property: 'list-style, margin', value: 'none, 0', gap: 'The kit has no plain list part.' }] })).toEqual([
      { file: 'b.css', selector: '.y', properties: ['list-style', 'margin'], reason: 'The kit has no plain list part.' },
    ]);
    expect(normalizeLedger({ exemptions: [{ block: 'ListCard', selector: '.card', property: 'border', waitsFor: 'A kit list card', reason: 'flush band' }] })).toEqual([
      { file: 'ListCard/ListCard.module.css', selector: '.card', properties: ['border'], reason: 'A kit list card' },
    ]);
  });
});

describe('checkRuledStylesheet', () => {
  const rows = [{ file: 'src/blocks/A/A.module.css', selector: '.title', properties: ['color', 'font-size'], reason: 'Kit gap: no lead role' }];

  it('passes layout declarations, block-local and layout-token custom properties on tokens, and declarations a ledger row covers', () => {
    const css = '.root { --a-gap: var(--space-4); --site-section-pad-top: var(--space-8); display: grid; gap: var(--a-gap); }\n.title { color: var(--muted-foreground); font-size: var(--text-body-size); }\n';
    expect(checkRuledStylesheet(`${BLOCKS}/A/A.module.css`, css, { key: 'src/blocks/A/A.module.css', rows }, new Set(['--site-section-pad-top']))).toEqual([]);
    expect(checkRuledStylesheet(`${BLOCKS}/A/A.module.css`, '.root { --button-bg: var(--primary); }', { key: 'src/blocks/A/A.module.css', rows })).toHaveLength(1);
    expect(checkRuledStylesheet(`${BLOCKS}/A/A.module.css`, '.box { --card-spacing: var(--space-8); --frame-order: 2; }', { key: 'src/blocks/A/A.module.css', rows }, new Set(['--frame-order']))).toEqual([]);
  });

  it('fails a non-layout declaration no row covers, naming file, line, selector and property', () => {
    const css = '.root {\n  display: grid;\n  color: var(--foreground);\n  padding: 28px;\n}\n';
    expect(checkRuledStylesheet(`${BLOCKS}/A/A.module.css`, css, { key: 'src/blocks/A/A.module.css', rows })).toEqual([
      `${BLOCKS}/A/A.module.css:3: .root { color: var(--foreground) } is not layout on tokens and no row of its exemptions ledger covers it`,
      `${BLOCKS}/A/A.module.css:4: .root { padding: 28px } is not layout on tokens and no row of its exemptions ledger covers it`,
    ]);
  });

  it('fails every non-layout declaration of a frame, which has no ledger', () => {
    const errors = checkRuledStylesheet('template-inbox/src-app/mfe_packages/shared/inbox/lifecycle/frame.module.css', '.frame { display: flex; color: red; }', { key: null, rows: [] });
    expect(errors).toEqual(['template-inbox/src-app/mfe_packages/shared/inbox/lifecycle/frame.module.css:1: .frame { color: red } is not layout on tokens and no row of its exemptions ledger covers it']);
  });
});

describe('checkLedgerRows', () => {
  it('fails a row whose file or selector no longer exists, a row naming a property its rule does not declare, and a row without a reason; a row on a block script checks its class and inline style property', () => {
    const files = new Map([
      ['src/blocks/A/A.module.css', '.title { color: var(--x); gap: var(--space-2); }\n'],
      ['src/blocks/A/A.tsx', '<span className={styles.dot} style={{ background: row.color }} />'],
    ]);
    const rows = [
      { file: 'src/blocks/A/A.module.css', selector: '.title', properties: ['color'], reason: 'Kit gap: tone' },
      { file: 'src/blocks/A/A.module.css', selector: '.gone', properties: ['color'], reason: 'Kit gap: tone' },
      { file: 'src/blocks/A/A.module.css', selector: '.title', properties: ['font-size'], reason: 'Kit gap: size' },
      { file: 'src/blocks/A/A.module.css', selector: '.title', properties: ['color'], reason: '' },
      { file: 'src/blocks/B/B.module.css', selector: '.x', properties: ['color'], reason: 'Kit gap' },
      { file: 'src/blocks/A/A.tsx', selector: '.dot', properties: ['background'], reason: 'Kit gap: legend swatch' },
      { file: 'src/blocks/A/A.tsx', selector: '.gone', properties: ['background'], reason: 'Kit gap: legend swatch' },
    ];
    expect(checkLedgerRows('t/styles-exemptions.json', rows, (file) => files.get(file))).toEqual([
      't/styles-exemptions.json: row 2 (src/blocks/A/A.module.css .gone) names a selector its file no longer has',
      't/styles-exemptions.json: row 3 (src/blocks/A/A.module.css .title) names font-size, which the rule no longer declares',
      't/styles-exemptions.json: row 4 (src/blocks/A/A.module.css .title) names no kit gap or defect it waits for',
      't/styles-exemptions.json: row 5 (src/blocks/B/B.module.css .x) names a file that does not exist',
      't/styles-exemptions.json: row 7 (src/blocks/A/A.tsx .gone) names a selector its file no longer has',
    ]);
  });
});

describe('layout token names and block-local reads', () => {
  it('reads the names the layout tokens file declares and the names a stylesheet reads', async () => {
    const { layoutTokenNames, customPropertiesRead } = await import('./style-rules.mjs');
    expect([...layoutTokenNames(':root { --site-column: 1px; }\n@media (max-width: 1px) { :root { --site-gap: 2px; } }')]).toEqual(['--site-column', '--site-gap']);
    expect([...customPropertiesRead('.a { gap: var(--a-gap, var( --b)); } /* var(--c) */')]).toEqual(['--a-gap', '--b']);
  });
});

describe('checkLayoutTokens', () => {
  it('accepts custom property declarations only', () => {
    expect(checkLayoutTokens('t/layout.css', ':root { --site-column: min(calc(100% - 136px), 1480px); }')).toEqual([]);
    expect(checkLayoutTokens('t/layout.css', ':root { --a: 1px; }\nbody { margin: 0; }')).toEqual(['t/layout.css:2: body { margin: 0 } is not a layout token; the layout tokens file declares custom properties only']);
  });
});

describe('checkComposition', () => {
  it('refuses a stylesheet import in any form', () => {
    expect(checkComposition(SCREEN, "import styles from './DocsScreen.module.css';\n")).toEqual([`${SCREEN}:1: imports a stylesheet (./DocsScreen.module.css); a composition carries no CSS, its arrangement belongs to a block`]);
    expect(checkComposition(SCREEN, "import './screen.css';")).toHaveLength(1);
    expect(checkComposition(SCREEN, "const sheet = await import('./x.css?inline');")).toHaveLength(1);
    expect(checkComposition(SCREEN, "import.meta.glob('./**/*.css', { eager: true });")).toHaveLength(1);
    expect(checkComposition(SCREEN, '// a comment about ./x.css\nconst a = 1;')).toEqual([]);
  });

  it("accepts the kit's theme.css?inline only in a file that anchors it with the theme helper", () => {
    const lifecycle = "import kitThemeCss from '@gears-frontx/ui-kit/theme.css?inline';\nimport { anchorKitThemeOnShadowHost } from './shared/anchorKitThemeOnShadowHost';\n";
    expect(checkComposition('template-x/src-app/mfe_packages/x-mfe/src/lifecycle.tsx', lifecycle)).toEqual([]);
    expect(checkComposition('template-x/src-app/mfe_packages/x-mfe/src/lifecycle.tsx', "import kitThemeCss from '@gears-frontx/ui-kit/theme.css?inline';\n")).toHaveLength(1);
  });

  it("accepts the shell's document entries: the kit theme and globals.css in main.tsx, the document.css glob in documentEntries.ts", () => {
    expect(checkComposition('site/src-app/app/main.tsx', "import '@gears-frontx/ui-kit/theme.css';\nimport './globals.css';\n")).toEqual([]);
    expect(checkComposition('site/src-app/app/documentEntries.ts', "import.meta.glob('../verify_packages/*/src/document.css', { eager: true });\n")).toEqual([]);
    expect(checkComposition('site/src-app/app/main.tsx', "import './extra.css';\n")).toHaveLength(1);
  });

  it('refuses a style prop and a foreign className, and accepts a kit variants call or a forwarded className', () => {
    expect(checkComposition(SCREEN, '<div style={{ padding: 8 }} />')).toEqual([`${SCREEN}:1: passes a style prop; a composition carries no CSS`]);
    expect(checkComposition(SCREEN, '<Card className={styles.card} />')).toEqual([`${SCREEN}:1: passes a className (styles.card) that is neither a kit variants call nor its own forwarded className`]);
    expect(checkComposition(SCREEN, '<a className={buttonVariants({ variant: "outline" })} href="/x">x</a>')).toEqual([]);
    expect(checkComposition(SCREEN, 'export const H = ({ className }) => <h1 className={className} />;')).toEqual([]);
  });
});

describe('checkColourLiterals', () => {
  it('refuses a hex colour in a block, a composition and a kit candidate', () => {
    expect(checkColourLiterals(`${BLOCKS}/A/A.module.css`, '.a { background: #eef4ff; }')).toEqual([`${BLOCKS}/A/A.module.css:1: colour literal #eef4ff; a colour comes from a brand or kit token`]);
    expect(checkColourLiterals(SCREEN, "const ink = '#0f172a';")).toHaveLength(1);
    expect(checkColourLiterals('template-kit-candidates/src-app/verify_packages/kit-candidates/src/components/text/Text.module.css', '.t { color: #fff; }')).toHaveLength(1);
  });

  it('accepts brand.json and its generated files, the art palettes, mask stops, id selectors, numbers and comments', () => {
    const brand = 'template-site-brand/src-app/verify_packages/site-brand/src';
    expect(checkColourLiterals(`${brand}/brand.json`, '{ "a": "#0065e3" }')).toEqual([]);
    expect(checkColourLiterals(`${brand}/tokens.css`, ':root { --a: #0065e3; }')).toEqual([]);
    expect(checkColourLiterals(`${brand}/theme.ts`, "export const a = '#0065e3';")).toEqual([]);
    expect(checkColourLiterals(`${brand}/art/HeroArt.module.css`, '.a { --hero-ink: #0756f5; }')).toEqual([]);
    expect(checkColourLiterals(`${BLOCKS}/A/A.module.css`, '.a { mask-image: linear-gradient(90deg, transparent, #000 40%); }')).toEqual([]);
    expect(checkColourLiterals('site/src-app/app/globals.css', '#root { min-height: 100%; }')).toEqual([]);
    expect(checkColourLiterals(SCREEN, "const order = { number: '#1001' };\n// fixed in #601\n/* #ffffff */")).toEqual([]);
  });
});
