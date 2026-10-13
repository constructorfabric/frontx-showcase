import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { checkFile, isExempt, runPolicyOwnStyles } from './policy-own-styles.mjs';

describe('checkFile', () => {
  it('accepts CSS Module classes, including a template literal of module classes only', () => {
    const tsx = ['<div className={styles.frame} />', '<p className={`${styles.a} ${active ? styles.b : ""}`} />', '<Icon aria-hidden="true" />'].join('\n');
    expect(checkFile('t/a.tsx', tsx)).toEqual([]);
    expect(checkFile('t/a.module.css', '.frame { padding: var(--space-4); }')).toEqual([]);
  });

  it('refuses a class name given as a string literal, in any form', () => {
    expect(checkFile('t/a.tsx', '<div className="p-4" />')).toHaveLength(1);
    expect(checkFile('t/a.tsx', "<div className={'flex gap-2'} />")).toHaveLength(1);
    expect(checkFile('t/a.tsx', '<div className={`p-4 ${styles.a}`} />')).toHaveLength(1);
    expect(checkFile('t/a.tsx', '<div className="p-4" />')[0]).toMatch(/^t\/a\.tsx:1: a class name as a string literal/);
  });

  it('refuses Tailwind imports, directives, @apply and config files', () => {
    expect(checkFile('t/a.css', '@import "tailwindcss";')).toEqual(['t/a.css:1: imports Tailwind']);
    expect(checkFile('t/a.css', '@tailwind base;')).toEqual(['t/a.css:1: a Tailwind directive']);
    expect(checkFile('t/a.module.css', '.x { @apply p-4; }')).toEqual(['t/a.module.css:1: @apply; write the declarations on ui-kit tokens']);
    expect(checkFile('t/a.ts', "import config from 'tailwindcss';")).toEqual(['t/a.ts:1: imports Tailwind']);
    expect(checkFile('t/a.ts', "import 'tailwindcss';")).toEqual(['t/a.ts:1: imports Tailwind']);
    expect(checkFile('t/a.tsx', 'import "tailwindcss/tailwind.css";')).toEqual(['t/a.tsx:1: imports Tailwind']);
    expect(checkFile('t/a.ts', "import plugin from 'tailwindcss/plugin';")).toEqual(['t/a.ts:1: imports Tailwind']);
    expect(checkFile('t/a.ts', "const plugin = require('tailwindcss/plugin');")).toEqual(['t/a.ts:1: imports Tailwind']);
    expect(checkFile('t/a.ts', "const merge = await import('@tailwindcss/vite');")).toEqual(['t/a.ts:1: imports Tailwind']);
    expect(checkFile('t/a.ts', "import { tailwindcssLike } from './tailwindcss-free';")).toEqual([]);
    expect(checkFile('t/tailwind.config.ts', 'export default {}')).toHaveLength(1);
    expect(checkFile('t/postcss.config.js', 'export default {}')).toHaveLength(1);
  });
});

describe('class name helpers', () => {
  it('refuse a utility string passed to cx, cn, clsx, classnames or twMerge, on one line or several', () => {
    for (const helper of ['cx', 'cn', 'clsx', 'classnames', 'twMerge']) {
      expect(checkFile('t/a.tsx', `<div className={${helper}('p-4', styles.a)} />`)).toEqual([
        `t/a.tsx:1: a class name as a string literal passed to a class name helper ('p-4'); use a CSS Module class`,
      ]);
    }
    expect(checkFile('t/a.tsx', '<div\n  className={cx(\n    styles.a,\n    active && "font-bold",\n  )}\n/>')).toEqual([
      't/a.tsx:4: a class name as a string literal passed to a class name helper ("font-bold"); use a CSS Module class',
    ]);
    expect(checkFile('t/a.tsx', '<div className={cn(`gap-2 ${styles.a}`)} />')).toHaveLength(1);
    expect(checkFile('t/a.ts', "export const classes = clsx('flex', styles.a);")).toHaveLength(1);
  });

  it('accept CSS Module classes and comparison operands inside a helper call', () => {
    expect(checkFile('t/a.tsx', '<div className={cx(styles.a, active && styles.b)} />')).toEqual([]);
    expect(checkFile('t/a.tsx', "<div className={cx(styles.a, variant === 'compact' && styles.compact, 'x' !== mode && styles.b)} />")).toEqual([]);
    expect(checkFile('t/a.tsx', '<div className={cx(`${styles.a} ${styles.b}`, (open ? styles.c : styles.d))} />')).toEqual([]);
  });
});

describe('isExempt', () => {
  it('exempts the copied demo files by path, and nothing beside them', () => {
    expect(isExempt('template-catalogue/src-app/mfe_packages/catalogue-mfe/src/examples/button.tsx')).toBe(true);
    expect(isExempt('template-catalogue/src-app/mfe_packages/catalogue-mfe/src/shared.tsx')).toBe(true);
    expect(isExempt('template-calendar-demo/src-app/mfe_packages/calendar-demo-mfe/src/screens/calendar/CalendarPages.tsx')).toBe(false);
    expect(isExempt('template-catalogue/src-app/mfe_packages/catalogue-mfe/src/routes.tsx')).toBe(false);
    expect(isExempt('template-site/src-app/mfe_packages/site-home-mfe/src/examples/x.tsx')).toBe(false);
  });
});

describe('runPolicyOwnStyles', () => {
  let root;
  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), 'own-styles-'));
    mkdirSync(path.join(root, 'template-demo', 'src-app', 'mfe_packages', 'demo-mfe', 'src'), { recursive: true });
    writeFileSync(path.join(root, 'template-demo', 'frontx-template.json'), '{}');
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it('names the file and line of a violation inside a template', () => {
    writeFileSync(path.join(root, 'template-demo', 'src-app', 'mfe_packages', 'demo-mfe', 'src', 'Screen.tsx'), 'export const S = () => (\n  <div className="p-4" />\n);\n');
    const { errors, checked } = runPolicyOwnStyles(root);
    expect(checked).toBe(2);
    expect(errors).toEqual(['template-demo/src-app/mfe_packages/demo-mfe/src/Screen.tsx:2: a class name as a string literal (className="p-4"); use a CSS Module class']);
  });

  it("checks the shell files the site owns and refuses a Tailwind or PostCSS config in the shell", () => {
    mkdirSync(path.join(root, 'site', 'src-app', 'app', 'layout'), { recursive: true });
    writeFileSync(path.join(root, 'site', 'src-app', 'app', 'layout', 'Header.tsx'), 'export const H = () => <header className="h-16" />;\n');
    writeFileSync(path.join(root, 'site', 'postcss.config.js'), 'export default {};\n');
    const { errors } = runPolicyOwnStyles(root);
    expect(errors).toEqual([
      'site/src-app/app/layout/Header.tsx:1: a class name as a string literal (className="h-16"); use a CSS Module class',
      'site/postcss.config.js: a postcss config file; the shell styles with CSS Modules on the ui-kit tokens',
    ]);
  });

  it('applies the composition rules to a screen, the block rules with their ledger to a block, and the colour rule everywhere', () => {
    const write = (relativePath, text) => {
      mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
      writeFileSync(path.join(root, relativePath), text);
    };
    const blocks = 'template-site-blocks/src-app/verify_packages/site-blocks';
    write('template-site-blocks/frontx-template.json', '{}');
    write(`${blocks}/src/blocks/Card/Card.module.css`, '.card {\n  display: grid;\n  color: var(--muted-foreground);\n  background: #eef4ff;\n}\n');
    write(`${blocks}/styles-exemptions.json`, JSON.stringify({ rows: [
      { file: 'src/blocks/Card/Card.module.css', selector: '.card', property: 'color', waitsFor: 'Kit gap: no muted card ink' },
      { file: 'src/blocks/Card/Card.module.css', selector: '.gone', property: 'color', waitsFor: 'Kit gap: none left' },
    ] }));
    write('template-demo/src-app/mfe_packages/demo-mfe/src/Screen.tsx', "import styles from './Screen.module.css';\nexport const S = () => <div style={{ padding: 8 }} />;\n");
    write('template-demo/src-app/mfe_packages/demo-mfe/src/Screen.module.css', '.s { padding: 8px; }\n');
    const { errors } = runPolicyOwnStyles(root);
    expect(errors.sort()).toEqual(
      [
        `${blocks}/src/blocks/Card/Card.module.css:4: .card { background: #eef4ff } is not layout on tokens and no row of its exemptions ledger covers it`,
        `${blocks}/src/blocks/Card/Card.module.css:4: colour literal #eef4ff; a colour comes from a brand or kit token`,
        `${blocks}/styles-exemptions.json: row 2 (src/blocks/Card/Card.module.css .gone) names a selector its file no longer has`,
        'template-demo/src-app/mfe_packages/demo-mfe/src/Screen.tsx:1: imports a stylesheet (./Screen.module.css); a composition carries no CSS, its arrangement belongs to a block',
        'template-demo/src-app/mfe_packages/demo-mfe/src/Screen.tsx:2: passes a style prop; a composition carries no CSS',
        'template-demo/src-app/mfe_packages/demo-mfe/src/Screen.module.css: a stylesheet outside a block, a kit candidate, the brand or the shell chrome; a composition carries no CSS',
      ].sort()
    );
  });

  it('holds the shell chrome to its ledger', () => {
    mkdirSync(path.join(root, 'site', 'src-app', 'app', 'layout'), { recursive: true });
    writeFileSync(path.join(root, 'site', 'src-app', 'app', 'globals.css'), 'body {\n  margin: 0;\n  color: var(--foreground);\n}\n');
    writeFileSync(path.join(root, 'site', 'src-app', 'app', 'layout', 'styles-exemptions.json'), JSON.stringify({ rows: [] }));
    const { errors } = runPolicyOwnStyles(root);
    expect(errors).toEqual(['site/src-app/app/globals.css:3: body { color: var(--foreground) } is not layout on tokens and no row of its exemptions ledger covers it']);
  });

  it('refuses Tailwind brought in through the shell build whoever owns the file: a dependency, a nested config, a Vite plugin', () => {
    mkdirSync(path.join(root, 'site', 'src-app', 'app', 'styles'), { recursive: true });
    writeFileSync(path.join(root, 'site', 'package.json'), JSON.stringify({ dependencies: { react: '19.0.0' }, devDependencies: { tailwindcss: '4.0.0', '@tailwindcss/vite': '4.0.0', 'tailwind-merge': '3.0.0' } }));
    writeFileSync(path.join(root, 'site', 'vite.config.ts'), "import tailwindcss from '@tailwindcss/vite';\nexport default { plugins: [tailwindcss()] };\n");
    writeFileSync(path.join(root, 'site', 'src-app', 'app', 'styles', 'tailwind.config.ts'), 'export default {};\n');
    // A shell workspace library ships as template-shell builds it.
    mkdirSync(path.join(root, 'site', 'packages', 'studio'), { recursive: true });
    writeFileSync(path.join(root, 'site', 'packages', 'studio', 'package.json'), JSON.stringify({ dependencies: { 'tailwind-merge': '3.0.0' } }));
    const { errors } = runPolicyOwnStyles(root);
    expect(errors.sort()).toEqual(
      [
        'site/package.json: declares tailwindcss in devDependencies; the site styles with CSS Modules on the ui-kit tokens',
        'site/package.json: declares @tailwindcss/vite in devDependencies; the site styles with CSS Modules on the ui-kit tokens',
        'site/package.json: declares tailwind-merge in devDependencies; the site styles with CSS Modules on the ui-kit tokens',
        'site/vite.config.ts:1: imports Tailwind',
        'site/src-app/app/styles/tailwind.config.ts: a tailwind config file; the shell styles with CSS Modules on the ui-kit tokens',
      ].sort()
    );
  });
});
