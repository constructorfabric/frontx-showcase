// The kit theme helpers every screen package of every template carries (architecture/DESIGN.md section 2.2): `anchorKitThemeOnShadowHost.ts` and `kitThemeScope.ts` are template-mfe's per-package helpers, so every copy in this repository stays code-identical to the copy template-mfe ships in the FrontX CLI inventory, apart from each template's own comments and `@cpt-` markers. A fix lands upstream and is copied again rather than forked here.
import fs, { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { findTemplateDirs } from './template-discovery.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** The helper modules, by file name. */
export const HELPERS = ['anchorKitThemeOnShadowHost.ts', 'kitThemeScope.ts'];

/** Where template-mfe keeps its copies, relative to the repository root (`npm run site:data` installs template-mfe there). */
export const UPSTREAM_DIR = path.join('.frontx-inventory', '@gears-frontx', 'frontx-template-mfe', 'src-app', 'mfe_packages', 'demo-mfe', 'src', 'shared');

/** Folders a template may hold locally that are not its source. */
const SKIPPED = new Set(['node_modules', 'dist', 'coverage', '.frontx']);

/** The code of a TypeScript module with its comments and layout removed: the module printed back from its syntax tree, so a comment delimiter inside a string or a regular expression stays code. */
export function codeOf(source) {
  const file = ts.createSourceFile('helper.ts', source, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
  return ts.createPrinter({ removeComments: true }).printFile(file);
}

/** Every file named `name` under `dir`, without installs, build output and AI bundles. */
function findFiles(dir, name) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return SKIPPED.has(entry.name) ? [] : findFiles(path.join(dir, entry.name), name);
    return entry.isFile() && entry.name === name ? [path.join(dir, entry.name)] : [];
  });
}

/** Every copy of a helper in the templates under `rootDir`, as repository-relative paths, sorted. */
export function helperCopies(rootDir, helper) {
  return findTemplateDirs(rootDir)
    .flatMap((templateDir) => findFiles(templateDir, helper))
    .map((file) => path.relative(rootDir, file).split(path.sep).join('/'))
    .sort();
}

/** The copies whose code differs from the upstream copy, as repository-relative paths. */
export function driftedCopies(rootDir, helper) {
  const upstream = path.join(rootDir, UPSTREAM_DIR, helper);
  if (!fs.existsSync(upstream)) throw new Error(`${path.join(UPSTREAM_DIR, helper)} is missing: template-mfe is not in the CLI inventory; run npm run site:data, which installs it`);
  const expected = codeOf(fs.readFileSync(upstream, 'utf8'));
  return helperCopies(rootDir, helper).filter((copy) => codeOf(fs.readFileSync(path.join(rootDir, copy), 'utf8')) !== expected);
}

describe('kit theme helpers on fixtures', () => {
  let fixture;
  const UPSTREAM = '/** Upstream prose. */\nexport function scope(theme: string): string {\n  return theme === \'dark\' ? \'dark\' : \'light\';\n}\n';

  function write(relative, text) {
    const file = path.join(fixture, relative);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, text);
  }

  beforeEach(() => {
    fixture = mkdtempSync(path.join(tmpdir(), 'kit-theme-helpers-'));
    write(path.join(UPSTREAM_DIR, 'kitThemeScope.ts'), UPSTREAM);
    write('template-a/frontx-template.json', '{}');
    write('template-b/frontx-template.json', '{}');
  });

  afterEach(() => {
    rmSync(fixture, { recursive: true, force: true });
  });

  it('accepts a copy that differs only in its comments, markers and layout', () => {
    write('template-a/src-app/mfe_packages/a-mfe/src/shared/kitThemeScope.ts', '// @cpt-algo:cpt-template-a-algo-x:p1\n/** Our own prose. */\nexport function scope(theme: string): string {\n    // @cpt-begin:cpt-template-a-algo-x:p1:inst-map\n    return theme === \'dark\' ? \'dark\' : \'light\';\n    // @cpt-end:cpt-template-a-algo-x:p1:inst-map\n}\n');
    expect(helperCopies(fixture, 'kitThemeScope.ts')).toEqual(['template-a/src-app/mfe_packages/a-mfe/src/shared/kitThemeScope.ts']);
    expect(driftedCopies(fixture, 'kitThemeScope.ts')).toEqual([]);
  });

  it('reports a copy whose code changed, wherever in a template it lives, and skips installs and test files', () => {
    write('template-a/src-app/mfe_packages/shared/a/theme/kitThemeScope.ts', UPSTREAM);
    write('template-b/src-app/mfe_packages/b-mfe/src/frame/kitThemeScope.ts', UPSTREAM.replace("'dark' ? 'dark'", "'night' ? 'dark'"));
    write('template-b/src-app/mfe_packages/b-mfe/node_modules/x/kitThemeScope.ts', 'drifted');
    write('template-b/src-app/mfe_packages/b-mfe/src/frame/kitThemeScope.test.ts', 'drifted');
    expect(helperCopies(fixture, 'kitThemeScope.ts')).toEqual(['template-a/src-app/mfe_packages/shared/a/theme/kitThemeScope.ts', 'template-b/src-app/mfe_packages/b-mfe/src/frame/kitThemeScope.ts']);
    expect(driftedCopies(fixture, 'kitThemeScope.ts')).toEqual(['template-b/src-app/mfe_packages/b-mfe/src/frame/kitThemeScope.ts']);
  });

  it('keeps a regular expression literal that contains comment delimiters as code', () => {
    expect(codeOf("const a = /\\/\\*[\\s\\S]*?\\*\\//g; // tail\n")).not.toBe(codeOf("const a = /\\/\\*[\\s\\S]*?\\*\\//m;\n"));
  });

  it('fails clearly when template-mfe is not in the inventory', () => {
    rmSync(path.join(fixture, '.frontx-inventory'), { recursive: true });
    expect(() => driftedCopies(fixture, 'kitThemeScope.ts')).toThrow(/run npm run site:data/);
  });
});

describe('kit theme helpers in the repository', () => {
  for (const helper of HELPERS) {
    it(`keeps every copy of ${helper} code-identical to template-mfe's`, () => {
      expect(helperCopies(root, helper).length).toBeGreaterThan(0);
      expect(driftedCopies(root, helper)).toEqual([]);
    });
  }
});
