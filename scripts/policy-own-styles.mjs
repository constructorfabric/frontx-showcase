#!/usr/bin/env node
// Styling policy of architecture/DESIGN.md section 4.2.2 for the code the site owns, everything under the templates and the applied template files the site changed or added (scripts/shell-changes.mjs): CSS Modules on ui-kit tokens only. It refuses a Tailwind import (any form, any `tailwindcss` subpath) or directive, a Tailwind or PostCSS config file, `@apply`, and a class name given as a string literal in a component or passed to a class name helper (cx, cn, clsx, classnames, twMerge) instead of a CSS Module class. It also holds the three-layer rule (scripts/style-rules.mjs): compositions carry no CSS, block and shell chrome stylesheets are layout on tokens apart from the rows of their exemptions ledgers, a ledger row stays current, and a colour literal stands only in the brand. Files copied from the kit's own demo keep their markup, inline styles and string class names, and are exempt by path.
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { findTemplateDirs } from './template-discovery.mjs';
import { isEntryPoint } from './entry-point.mjs';
import { ownedAppliedFiles } from './shell-changes.mjs';
import { BLOCK_SCOPES, CHROME_SCOPE, LAYOUT_TOKENS_FILE, checkColourLiterals, checkComposition, checkLayoutTokens, checkLedgerRows, checkRuledStylesheet, classifyFile, customPropertiesRead, layoutTokenNames, normalizeLedger } from './style-rules.mjs';

/** Files and folders copied from the kits' demos, relative to the repository root (a trailing `/` exempts a folder). */
export const EXEMPT_PATHS = [
  'template-catalogue/src-app/mfe_packages/catalogue-mfe/src/examples/',
  'template-catalogue/src-app/mfe_packages/catalogue-mfe/src/pages/',
  'template-catalogue/src-app/mfe_packages/catalogue-mfe/src/shared.tsx',
];

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css']);
const CONFIG_FILE = /^(tailwind|postcss)\.config\.[cm]?[jt]s$/;
// The packages that bring Tailwind into a build: the compiler and its plugins, its Vite and PostCSS integrations, and the class merger.
const TAILWIND_PACKAGE = /^(?:tailwindcss(?:-.+)?|@tailwindcss\/.+|tailwind-merge|tailwind-variants)$/;
const DEPENDENCY_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
// `import x from 'tailwindcss'`, `import 'tailwindcss'`, `import('tailwindcss/plugin')`, `require(...)`, `@import "tailwindcss"`, any subpath of `tailwindcss` and any `@tailwindcss/*` package.
const TAILWIND_IMPORT = /(?:\bfrom\s+|\bimport\s+|\bimport\s*\(\s*|\brequire\s*\(\s*|@import\s+(?:url\()?\s*)['"](?:tailwindcss(?:\/[^'"]*)?|@tailwindcss\/[^'"]*)['"]/;
const TAILWIND_DIRECTIVE = /^\s*@(?:tailwind|config|plugin)\b/m;
const APPLY = /@apply\b/;
// className="...", className='...', className={'...'}, className={"..."}, and a template literal with text outside its interpolations.
const STRING_CLASS = /className\s*=\s*(?:"[^"]*[^\s"][^"]*"|'[^']*[^\s'][^']*'|\{\s*["'][^"']*\S[^"']*["']\s*\}|\{\s*`(?:[^`$]|\$(?!\{))*?[A-Za-z][^`]*`\s*\})/;

// Class name helpers (classnames, clsx, cx, cn, tailwind-merge): a string literal passed to one is a utility class, wherever the call sits.
const CLASS_HELPER_CALL = /\b(?:cx|cn|clsx|classnames|classNames|twMerge|twJoin)\s*\(/g;
const STRING_LITERAL = /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g;

/**
 * The argument text of a call whose opening parenthesis ends at `start`, up to its balanced closing parenthesis (string literals skipped).
 * @param {string} text
 * @param {number} start
 */
function callArguments(text, start) {
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
    else if (char === '(') depth += 1;
    else if (char === ')') {
      depth -= 1;
      if (depth === 0) return text.slice(start, index);
    }
  }
  return text.slice(start);
}

/**
 * Class strings passed to a class name helper: every string literal argument with class text, except an operand of a comparison (`variant === 'compact' && styles.compact`).
 * @param {string} text - the whole file
 * @returns {Array<{ line: number, literal: string }>}
 */
// @cpt-algo:cpt-site-algo-repository-policies-check-file-styles:p3
export function helperClassStrings(text) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-file-styles:p3:inst-helper-strings
  const found = [];
  for (const call of text.matchAll(CLASS_HELPER_CALL)) {
    const start = (call.index ?? 0) + call[0].length;
    const args = callArguments(text, start);
    for (const literal of args.matchAll(STRING_LITERAL)) {
      const before = args.slice(0, literal.index).trimEnd();
      const after = args.slice((literal.index ?? 0) + literal[0].length).trimStart();
      if (/[=!]=$/.test(before) || /^[=!]=/.test(after)) continue;
      const body = literal[0].slice(1, -1);
      const classText = literal[0].startsWith('`') ? body.replace(/\$\{[^}]*\}/g, '') : body;
      if (!/[A-Za-z0-9_-]/.test(classText)) continue;
      const line = text.slice(0, start + (literal.index ?? 0)).split('\n').length;
      found.push({ line, literal: literal[0] });
    }
  }
  return found;
  // @cpt-end:cpt-site-algo-repository-policies-check-file-styles:p3:inst-helper-strings
}

/**
 * Whether a repository-relative path is a copied demo file.
 * @param {string} relativePath - with `/` separators
 */
// @cpt-algo:cpt-site-algo-repository-policies-check-styles:p3
export function isExempt(relativePath) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-styles:p3:inst-check-templates
  return EXEMPT_PATHS.some((exempt) => (exempt.endsWith('/') ? relativePath.startsWith(exempt) : relativePath === exempt));
  // @cpt-end:cpt-site-algo-repository-policies-check-styles:p3:inst-check-templates
}

/**
 * Tailwind packages a `package.json` declares.
 * @param {string} relativePath
 * @param {string} text - the manifest's content
 */
export function checkPackageJson(relativePath, text) {
  const manifest = JSON.parse(text);
  const errors = [];
  for (const field of DEPENDENCY_FIELDS) {
    const dependencies = manifest[field];
    if (typeof dependencies !== 'object' || dependencies === null) continue;
    for (const name of Object.keys(dependencies)) if (TAILWIND_PACKAGE.test(name)) errors.push(`${relativePath}: declares ${name} in ${field}; the site styles with CSS Modules on the ui-kit tokens`);
  }
  return errors;
}

/**
 * Tailwind wiring in a shell file the site left as template-shell ships it: an import, a directive or `@apply`. Its markup is upstream's and not checked, but a build plugin or stylesheet that brings Tailwind back is.
 * @param {string} relativePath
 * @param {string} text
 */
export function checkTailwindWiring(relativePath, text) {
  const ext = path.posix.extname(relativePath);
  const errors = [];
  text.split('\n').forEach((line, index) => {
    const at = `${relativePath}:${index + 1}`;
    if (TAILWIND_IMPORT.test(line)) errors.push(`${at}: imports Tailwind`);
    if (ext === '.css' && TAILWIND_DIRECTIVE.test(line)) errors.push(`${at}: a Tailwind directive`);
    if (ext === '.css' && APPLY.test(line)) errors.push(`${at}: @apply; write the declarations on ui-kit tokens`);
  });
  return errors;
}

/** Whether a template literal class name holds text outside `${...}` (a utility class), rather than only CSS Module references. */
function templateHasText(literal) {
  return /[A-Za-z0-9_-]/.test(literal.replace(/\$\{[^}]*\}/g, ''));
}

/**
 * Policy violations in one file.
 * @param {string} relativePath - repository-relative, `/` separators
 * @param {string} text - the file's content
 */
export function checkFile(relativePath, text) {
  const errors = [];
  const base = path.posix.basename(relativePath);
  // @cpt-begin:cpt-site-algo-repository-policies-check-file-styles:p3:inst-if-config-file
  if (CONFIG_FILE.test(base)) errors.push(`${relativePath}: a ${base.split('.')[0]} config file; templates style with CSS Modules only`);
  // @cpt-end:cpt-site-algo-repository-policies-check-file-styles:p3:inst-if-config-file
  // @cpt-begin:cpt-site-algo-repository-policies-check-file-styles:p3:inst-if-not-source
  const ext = path.posix.extname(relativePath);
  if (!SOURCE_EXTENSIONS.has(ext)) return errors;
  // @cpt-end:cpt-site-algo-repository-policies-check-file-styles:p3:inst-if-not-source
  const lines = text.split('\n');
  // @cpt-begin:cpt-site-algo-repository-policies-check-file-styles:p3:inst-helper-strings
  if (['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'].includes(ext)) {
    for (const { line, literal } of helperClassStrings(text)) errors.push(`${relativePath}:${line}: a class name as a string literal passed to a class name helper (${literal}); use a CSS Module class`);
  }
  // @cpt-end:cpt-site-algo-repository-policies-check-file-styles:p3:inst-helper-strings
  // @cpt-begin:cpt-site-algo-repository-policies-check-file-styles:p3:inst-line-rules
  lines.forEach((line, index) => {
    const at = `${relativePath}:${index + 1}`;
    if (TAILWIND_IMPORT.test(line)) errors.push(`${at}: imports Tailwind`);
    if (ext === '.css' && TAILWIND_DIRECTIVE.test(line)) errors.push(`${at}: a Tailwind directive`);
    if (ext === '.css' && APPLY.test(line)) errors.push(`${at}: @apply; write the declarations on ui-kit tokens`);
    if (ext === '.tsx' || ext === '.jsx') {
      const match = STRING_CLASS.exec(line);
      if (match) {
        const literal = /`([^`]*)`/.exec(match[0]);
        if (!literal || templateHasText(literal[1])) errors.push(`${at}: a class name as a string literal (${match[0].trim()}); use a CSS Module class`);
      }
    }
  });
  // @cpt-end:cpt-site-algo-repository-policies-check-file-styles:p3:inst-line-rules
  // @cpt-begin:cpt-site-algo-repository-policies-check-file-styles:p3:inst-return-file-violations
  return errors;
  // @cpt-end:cpt-site-algo-repository-policies-check-file-styles:p3:inst-return-file-violations
}

/**
 * The ledgers of the block scopes and the shell chrome that exist under root, read once, and the layout custom properties: the blocks' layout tokens and every name a block or chrome stylesheet reads.
 * @param {string} root
 * @returns {{ ledgers: Map<string, { base: string, rows: ReturnType<typeof normalizeLedger> }>, layoutCustom: Set<string> }}
 */
function readStyleContext(root) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-styles:p3:inst-read-ledgers
  const ledgers = new Map();
  for (const { ledger, base } of [...BLOCK_SCOPES, CHROME_SCOPE]) {
    const file = path.join(root, ledger);
    if (fs.existsSync(file)) ledgers.set(ledger, { base, rows: normalizeLedger(JSON.parse(fs.readFileSync(file, 'utf8'))) });
  }
  const tokensFile = path.join(root, LAYOUT_TOKENS_FILE);
  const layoutCustom = fs.existsSync(tokensFile) ? layoutTokenNames(fs.readFileSync(tokensFile, 'utf8')) : new Set();
  // Every custom property a block, frame or chrome stylesheet reads is a layout custom property: a block-local value, or the arrangement hook a frame block offers the blocks composed in it.
  for (const dir of [...BLOCK_SCOPES.map((scope) => scope.root), ...CHROME_SCOPE.roots]) {
    const full = path.join(root, dir);
    if (!fs.existsSync(full)) continue;
    for (const file of walk(full, [])) if (file.endsWith('.css')) for (const name of customPropertiesRead(fs.readFileSync(file, 'utf8'))) layoutCustom.add(name);
  }
  return { ledgers, layoutCustom };
  // @cpt-end:cpt-site-algo-repository-policies-check-styles:p3:inst-read-ledgers
}

/**
 * The three-layer rule on one site-owned file: a composition's imports and props, a block's, frame's or chrome's stylesheet against its ledger, the layout tokens file, and colour literals everywhere.
 * @param {string} relativePath
 * @param {string} text
 * @param {ReturnType<typeof readStyleContext>} context
 */
// @cpt-algo:cpt-site-algo-repository-policies-check-layers:p3
// @cpt-dod:cpt-site-dod-repository-policies-layers:p3
export function checkLayers(relativePath, text, context) {
  const errors = [];
  const ext = path.posix.extname(relativePath);
  // @cpt-begin:cpt-site-algo-repository-policies-check-layers:p3:inst-classify
  const { kind, ledger, key } = classifyFile(relativePath);
  // @cpt-end:cpt-site-algo-repository-policies-check-layers:p3:inst-classify
  // @cpt-begin:cpt-site-algo-repository-policies-check-layers:p3:inst-if-composition
  if (kind === 'composition') {
    if (ext === '.css') errors.push(`${relativePath}: a stylesheet outside a block, a kit candidate, the brand or the shell chrome; a composition carries no CSS`);
    else if (/^\.[cm]?[jt]sx?$/.test(ext)) errors.push(...checkComposition(relativePath, text));
  }
  // @cpt-end:cpt-site-algo-repository-policies-check-layers:p3:inst-if-composition
  // @cpt-begin:cpt-site-algo-repository-policies-check-layers:p3:inst-if-ruled
  if ((kind === 'block' || kind === 'frame' || kind === 'chrome') && ext === '.css') {
    const rows = (ledger && context.ledgers.get(ledger)?.rows) || [];
    errors.push(...checkRuledStylesheet(relativePath, text, { key: key ?? null, rows }, context.layoutCustom));
  }
  if (kind === 'layout-tokens') errors.push(...checkLayoutTokens(relativePath, text));
  // @cpt-end:cpt-site-algo-repository-policies-check-layers:p3:inst-if-ruled
  // @cpt-begin:cpt-site-algo-repository-policies-check-layers:p3:inst-colours
  errors.push(...checkColourLiterals(relativePath, text));
  return errors;
  // @cpt-end:cpt-site-algo-repository-policies-check-layers:p3:inst-colours
}

const SKIPPED_DIRS = new Set(['node_modules', 'dist', 'coverage']);
// Under site/: build outputs, and the composed copies of the templates, which the template walk below checks at their source.
const SITE_SKIPPED_DIRS = new Set([...SKIPPED_DIRS, 'dist-lib', '.vite', 'mfe_packages', '.frontx']);

function walk(dir, out, skipped = SKIPPED_DIRS) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipped.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out, skipped);
    else out.push(full);
  }
  return out;
}

/**
 * @param {string} root
 * @returns {{ errors: string[], checked: number, exempt: number }}
 */
// @cpt-dod:cpt-site-dod-repository-policies-own-styles:p3
export function runPolicyOwnStyles(root) {
  const errors = [];
  let checked = 0;
  let exempt = 0;
  // @cpt-begin:cpt-site-algo-repository-policies-check-styles:p3:inst-read-ledgers
  const context = readStyleContext(root);
  // @cpt-end:cpt-site-algo-repository-policies-check-styles:p3:inst-read-ledgers
  // The shell files the site changed or added are site-owned code too; and the shell itself carries no Tailwind or PostCSS config.
  // @cpt-begin:cpt-site-algo-repository-policies-check-styles:p3:inst-check-owned-shell
  for (const relativePath of ownedAppliedFiles()) {
    const file = path.join(root, relativePath);
    if (!fs.existsSync(file) || !SOURCE_EXTENSIONS.has(path.posix.extname(relativePath))) continue;
    checked += 1;
    const text = fs.readFileSync(file, 'utf8');
    errors.push(...checkFile(relativePath, text), ...checkLayers(relativePath, text, context));
  }
  // @cpt-end:cpt-site-algo-repository-policies-check-styles:p3:inst-check-owned-shell
  // Every other file of the shell's build is checked for Tailwind wiring whoever owns it: a dependency, a config file at any depth, or an import in the Vite config or the application sources would bring Tailwind back without touching a site-owned file.
  // @cpt-begin:cpt-site-algo-repository-policies-check-styles:p3:inst-check-shell-build
  const siteDir = path.join(root, 'site');
  if (fs.existsSync(siteDir)) {
    const owned = new Set(ownedAppliedFiles());
    for (const file of walk(siteDir, [], SITE_SKIPPED_DIRS)) {
      const relativePath = path.relative(root, file).split(path.sep).join('/');
      const base = path.posix.basename(relativePath);
      if (CONFIG_FILE.test(base)) errors.push(`${relativePath}: a ${base.split('.')[0]} config file; the shell styles with CSS Modules on the ui-kit tokens`);
      // The shell's workspace libraries under site/packages/ ship as template-shell builds them (the Studio overlay merges class names with tailwind-merge); the application's own manifest is site/package.json.
      if (base === 'package.json') {
        if (!relativePath.startsWith('site/packages/')) errors.push(...checkPackageJson(relativePath, fs.readFileSync(file, 'utf8')));
      }
      else if (!owned.has(relativePath) && SOURCE_EXTENSIONS.has(path.posix.extname(relativePath))) errors.push(...checkTailwindWiring(relativePath, fs.readFileSync(file, 'utf8')));
    }
  }
  // @cpt-end:cpt-site-algo-repository-policies-check-styles:p3:inst-check-shell-build
  // @cpt-begin:cpt-site-algo-repository-policies-check-styles:p3:inst-check-templates
  for (const templateDir of findTemplateDirs(root)) {
    for (const file of walk(templateDir, [])) {
      const relativePath = path.relative(root, file).split(path.sep).join('/');
      if (isExempt(relativePath)) {
        exempt += 1;
        continue;
      }
      checked += 1;
      const text = fs.readFileSync(file, 'utf8');
      errors.push(...checkFile(relativePath, text));
      if (SOURCE_EXTENSIONS.has(path.posix.extname(relativePath))) errors.push(...checkLayers(relativePath, text, context));
      if (path.posix.basename(relativePath) === 'package.json') errors.push(...checkPackageJson(relativePath, text));
    }
  }
  // @cpt-end:cpt-site-algo-repository-policies-check-styles:p3:inst-check-templates
  // Every ledger row must still point at a declaration and name what it waits for.
  // @cpt-begin:cpt-site-algo-repository-policies-check-styles:p3:inst-check-ledgers
  for (const [ledger, { base, rows }] of context.ledgers) {
    errors.push(...checkLedgerRows(ledger, rows, (file) => {
      const full = path.join(root, base, file);
      return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : undefined;
    }));
  }
  // @cpt-end:cpt-site-algo-repository-policies-check-styles:p3:inst-check-ledgers
  // @cpt-begin:cpt-site-algo-repository-policies-check-styles:p3:inst-return-style-result
  return { errors, checked, exempt };
  // @cpt-end:cpt-site-algo-repository-policies-check-styles:p3:inst-return-style-result
}

// @cpt-flow:cpt-site-flow-repository-policies-run-policy:p3
if (isEntryPoint(import.meta.url)) {
  // @cpt-begin:cpt-site-flow-repository-policies-run-policy:p3:inst-run-policy
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const { errors, checked, exempt } = runPolicyOwnStyles(root);
  // @cpt-end:cpt-site-flow-repository-policies-run-policy:p3:inst-run-policy
  // @cpt-begin:cpt-site-flow-repository-policies-run-policy:p3:inst-if-findings
  if (errors.length > 0) {
    for (const error of errors) console.error(`policy:own-styles: ${error}`);
    process.exit(1);
  }
  // @cpt-end:cpt-site-flow-repository-policies-run-policy:p3:inst-if-findings
  // @cpt-begin:cpt-site-flow-repository-policies-run-policy:p3:inst-report-checked
  console.log(`policy:own-styles: ${checked} files use CSS Modules only and keep the layer rules (${exempt} copied demo files exempt by path)`);
  // @cpt-end:cpt-site-flow-repository-policies-run-policy:p3:inst-report-checked
}
