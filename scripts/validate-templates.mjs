#!/usr/bin/env node
// Validates every template of this repository: the FrontX CLI's own `frontx validate` (manifest contract and content self-containment), then the uniform-shape rules of architecture/DESIGN.md section 4.2.1: overlay only, identity prefix, claims only screen packages under `src-app/mfe_packages/`, non-screen packages (tooling, brand, components) under `src-app/verify_packages/` and the template's own AI bundle, README sections present in order, and the root `.gitignore` listing exactly the AI bundle paths of the existing templates and the site copies of their non-screen packages.
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { findTemplateDirs, readTemplateManifest } from './template-discovery.mjs';
import { isEntryPoint } from './entry-point.mjs';

export const IDENTITY_PREFIX = '@gears-frontx/frontx-template-';
export const README_SECTIONS = ['What it contributes', 'Prerequisites', 'Screens and routes', 'SEO metadata', 'Develop', 'Moving into another project'];
export const ALLOWED_TOP_LEVEL = new Set(['frontx-template.json', 'README.md', 'architecture', 'src-app', '.frontx']);
export const FORBIDDEN_PATHS = ['package.json', 'package-lock.json', 'src-app/vitest.mfe.base.ts', 'src-app/__test-utils__'];
// Entries git never records (the root .gitignore's install, build-output, editor and OS lines); a template directory may hold them locally.
export const IGNORED_TOP_LEVEL = [/^node_modules$/, /^dist$/, /^coverage$/, /\.tsbuildinfo$/, /\.log$/, /^\.DS_Store$/, /^Thumbs\.db$/, /^\.idea$/, /^\.vscode$/, /\.sw.$/];
// A claimed package directory: `src-app/mfe_packages/<package>/` (any name but `shared`) or the shared folder `src-app/mfe_packages/shared/<name>/`.
const PACKAGE_SUBTREE = /^src-app\/mfe_packages\/(?:shared\/[^/]+|(?!shared\/)[^/]+)\/$/;
// A non-screen package (tooling, brand, components): `src-app/verify_packages/<package>/`, the shell's workspace root for packages a template delivers that are not screens (its install, type-check and test runs reach them, and other packages depend on it by name).
const VERIFY_SUBTREE = /^src-app\/verify_packages\/[^/]+\/$/;
const BUNDLE_LINE = /^site\/\.frontx\/ai\/@gears-frontx\/(frontx-template-[a-z0-9-]+)\/$/;
const VERIFY_LINE = /^site\/(src-app\/verify_packages\/[^/]+\/)$/;

/** @param {string} templateDir */
export function templateShortName(templateDir) {
  const base = path.basename(templateDir);
  return base.startsWith('template-') ? base.slice('template-'.length) : undefined;
}

/** @param {string} name */
export function bundlePath(name) {
  return `.frontx/ai/@gears-frontx/frontx-template-${name}/`;
}

/**
 * The `##` headings of a README, in order.
 * @param {string} text
 */
export function readmeHeadings(text) {
  return text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
}

// @cpt-algo:cpt-site-algo-template-shape-guard-shape:p2
/**
 * Shape errors of one template directory.
 * @param {string} templateDir
 */
export function checkTemplateShape(templateDir) {
  // @cpt-begin:cpt-site-algo-template-shape-guard-shape:p2:inst-name
  const errors = [];
  const name = templateShortName(templateDir);
  if (!name) return [`directory name must be template-<name>`];
  // @cpt-end:cpt-site-algo-template-shape-guard-shape:p2:inst-name
  // @cpt-begin:cpt-site-algo-template-shape-guard-shape:p2:inst-identity
  const manifest = readTemplateManifest(templateDir);
  if (manifest.name !== `${IDENTITY_PREFIX}${name}`) errors.push(`identity ${manifest.name} must be ${IDENTITY_PREFIX}${name}`);
  // @cpt-end:cpt-site-algo-template-shape-guard-shape:p2:inst-identity
  // @cpt-begin:cpt-site-algo-template-shape-guard-shape:p2:inst-no-referenced
  if ('referencedTemplates' in manifest) errors.push('referencedTemplates is not allowed; state the prerequisite in description and README');
  // @cpt-end:cpt-site-algo-template-shape-guard-shape:p2:inst-no-referenced
  // @cpt-begin:cpt-site-algo-template-shape-guard-shape:p2:inst-overlay
  const boundaries = manifest.ownershipBoundaries ?? {};
  if ((boundaries.sharedFiles ?? []).length > 0) errors.push('sharedFiles must be empty (overlay only)');
  // @cpt-end:cpt-site-algo-template-shape-guard-shape:p2:inst-overlay
  // @cpt-begin:cpt-site-algo-template-shape-guard-shape:p2:inst-own-bundle
  const subtrees = boundaries.exclusiveSubtrees ?? [];
  const ownBundle = bundlePath(name);
  if (!subtrees.includes(ownBundle)) errors.push(`must claim its own AI bundle ${ownBundle}`);
  // @cpt-end:cpt-site-algo-template-shape-guard-shape:p2:inst-own-bundle
  // @cpt-begin:cpt-site-algo-template-shape-guard-shape:p2:inst-subtrees
  for (const subtree of subtrees) {
    const isPackage = PACKAGE_SUBTREE.test(subtree) || VERIFY_SUBTREE.test(subtree);
    if (!isPackage && subtree !== ownBundle) errors.push(`claims ${subtree}; only src-app/mfe_packages/<package>/, src-app/mfe_packages/shared/<name>/, src-app/verify_packages/<package>/ and ${ownBundle} are allowed`);
    if (/^src-app\/mfe_packages\/shared\//.test(subtree) && subtree !== `src-app/mfe_packages/shared/${name}/`) errors.push(`claims ${subtree}; a template's shared folder is src-app/mfe_packages/shared/${name}/`);
    if (!fs.existsSync(path.join(templateDir, subtree))) errors.push(`claims ${subtree}, which does not exist`);
  }
  // @cpt-end:cpt-site-algo-template-shape-guard-shape:p2:inst-subtrees
  // @cpt-begin:cpt-site-algo-template-shape-guard-shape:p2:inst-forbidden
  for (const forbidden of FORBIDDEN_PATHS) {
    if (fs.existsSync(path.join(templateDir, forbidden))) errors.push(`${forbidden} is not allowed in a template (the site is the harness)`);
  }
  // @cpt-end:cpt-site-algo-template-shape-guard-shape:p2:inst-forbidden
  // @cpt-begin:cpt-site-algo-template-shape-guard-shape:p2:inst-top-level
  for (const entry of fs.readdirSync(templateDir)) {
    if (IGNORED_TOP_LEVEL.some((pattern) => pattern.test(entry))) continue;
    if (!ALLOWED_TOP_LEVEL.has(entry)) errors.push(`${entry} is outside the template shape`);
  }
  // @cpt-end:cpt-site-algo-template-shape-guard-shape:p2:inst-top-level
  // @cpt-begin:cpt-site-algo-template-shape-guard-shape:p2:inst-readme
  const readme = path.join(templateDir, 'README.md');
  if (!fs.existsSync(readme)) {
    errors.push('README.md is missing');
  } else {
    const headings = readmeHeadings(fs.readFileSync(readme, 'utf8'));
    let cursor = 0;
    for (const section of README_SECTIONS) {
      const index = headings.indexOf(section, cursor);
      if (index === -1) errors.push(`README.md lacks the section "## ${section}" (or it is out of order)`);
      else cursor = index + 1;
    }
  }
  // @cpt-end:cpt-site-algo-template-shape-guard-shape:p2:inst-readme
  // @cpt-begin:cpt-site-algo-template-shape-guard-shape:p2:inst-return-shape
  return errors;
  // @cpt-end:cpt-site-algo-template-shape-guard-shape:p2:inst-return-shape
}

// @cpt-algo:cpt-site-algo-template-shape-guard-gitignore-bundles:p2
/**
 * Errors when the root .gitignore's bundle lines and the set of templates differ.
 * @param {string} gitignoreText
 * @param {string[]} templateDirs
 */
export function checkGitignoreBundles(gitignoreText, templateDirs) {
  // @cpt-begin:cpt-site-algo-template-shape-guard-gitignore-bundles:p2:inst-bundles-listed
  /** @type {Set<string>} */
  const listed = new Set();
  for (const line of gitignoreText.split('\n')) {
    const id = line.trim().match(BUNDLE_LINE)?.[1];
    if (id) listed.add(id);
  }
  // @cpt-end:cpt-site-algo-template-shape-guard-gitignore-bundles:p2:inst-bundles-listed
  // @cpt-begin:cpt-site-algo-template-shape-guard-gitignore-bundles:p2:inst-bundles-expected
  const expected = new Set(templateDirs.map((dir) => templateShortName(dir)).filter((name) => name !== undefined).map((name) => `frontx-template-${name}`));
  // @cpt-end:cpt-site-algo-template-shape-guard-gitignore-bundles:p2:inst-bundles-expected
  // @cpt-begin:cpt-site-algo-template-shape-guard-gitignore-bundles:p2:inst-bundles-compare
  const errors = [];
  for (const id of expected) if (!listed.has(id)) errors.push(`.gitignore must list site/.frontx/ai/@gears-frontx/${id}/`);
  for (const id of listed) if (!expected.has(id)) errors.push(`.gitignore lists site/.frontx/ai/@gears-frontx/${id}/ but no such template exists`);
  // @cpt-end:cpt-site-algo-template-shape-guard-gitignore-bundles:p2:inst-bundles-compare
  // @cpt-begin:cpt-site-algo-template-shape-guard-gitignore-bundles:p2:inst-bundles-return
  return errors;
  // @cpt-end:cpt-site-algo-template-shape-guard-gitignore-bundles:p2:inst-bundles-return
}

// @cpt-algo:cpt-site-algo-template-shape-guard-gitignore-tooling:p2
/**
 * Errors when the root .gitignore's lines for `src-app/verify_packages/` and the non-screen packages the templates claim differ. The shell's .gitignore keeps the composed screen packages out of git, not `src-app/verify_packages/`, where the shell's own applied templates keep their packages; the site copy of this repository's non-screen packages is listed here instead.
 * @param {string} gitignoreText
 * @param {string[]} templateDirs
 */
export function checkGitignoreVerifyPackages(gitignoreText, templateDirs) {
  // @cpt-begin:cpt-site-algo-template-shape-guard-gitignore-tooling:p2:inst-tooling-listed
  /** @type {Set<string>} */
  const listed = new Set();
  for (const line of gitignoreText.split('\n')) {
    const subtree = line.trim().match(VERIFY_LINE)?.[1];
    if (subtree) listed.add(subtree);
  }
  // @cpt-end:cpt-site-algo-template-shape-guard-gitignore-tooling:p2:inst-tooling-listed
  // @cpt-begin:cpt-site-algo-template-shape-guard-gitignore-tooling:p2:inst-tooling-claimed
  const claimed = new Set(templateDirs.flatMap((dir) => (readTemplateManifest(dir).ownershipBoundaries?.exclusiveSubtrees ?? []).filter((subtree) => VERIFY_SUBTREE.test(subtree))));
  // @cpt-end:cpt-site-algo-template-shape-guard-gitignore-tooling:p2:inst-tooling-claimed
  // @cpt-begin:cpt-site-algo-template-shape-guard-gitignore-tooling:p2:inst-tooling-compare
  const errors = [];
  for (const subtree of claimed) if (!listed.has(subtree)) errors.push(`.gitignore must list site/${subtree}`);
  for (const subtree of listed) if (!claimed.has(subtree)) errors.push(`.gitignore lists site/${subtree} but no template claims it`);
  // @cpt-end:cpt-site-algo-template-shape-guard-gitignore-tooling:p2:inst-tooling-compare
  // @cpt-begin:cpt-site-algo-template-shape-guard-gitignore-tooling:p2:inst-tooling-return
  return errors;
  // @cpt-end:cpt-site-algo-template-shape-guard-gitignore-tooling:p2:inst-tooling-return
}

/** @param {(specifier: string) => Promise<unknown>} [importFn] */
export async function loadCliModule(importFn = (specifier) => import(specifier)) {
  try {
    return { ok: true, module: /** @type {any} */ (await importFn('@gears-frontx/cli')) };
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ERR_MODULE_NOT_FOUND') {
      return { ok: false, message: '@gears-frontx/cli is not installed; run `npm ci` at the repository root first' };
    }
    throw error;
  }
}

// @cpt-flow:cpt-site-flow-template-shape-guard-validate:p2
// @cpt-dod:cpt-site-dod-template-shape-guard-uniform-shape:p2
// @cpt-dod:cpt-site-dod-template-shape-guard-gitignore-lists:p2
/**
 * @param {{ rootDir?: string, loadCliModule?: typeof loadCliModule, log?: (line: string) => void, logError?: (line: string) => void }} [options]
 * @returns {Promise<number>}
 */
export async function runCli(options = {}) {
  const rootDir = options.rootDir ?? process.cwd();
  const log = options.log ?? console.log;
  const logError = options.logError ?? console.error;
  // @cpt-begin:cpt-site-flow-template-shape-guard-validate:p2:inst-load-cli
  const loaded = await (options.loadCliModule ?? loadCliModule)();
  if (!loaded.ok) {
    logError(`[validate-templates] FAIL: ${loaded.message}`);
    return 1;
  }
  // @cpt-end:cpt-site-flow-template-shape-guard-validate:p2:inst-load-cli
  // @cpt-begin:cpt-site-flow-template-shape-guard-validate:p2:inst-discover
  const { createFsListContentOwnedFilesFn, createFsReadFileFn, MANIFEST_FILENAME, validateCommand } = loaded.module;
  const templateDirs = findTemplateDirs(rootDir, MANIFEST_FILENAME);
  let failed = false;
  // @cpt-end:cpt-site-flow-template-shape-guard-validate:p2:inst-discover
  // @cpt-begin:cpt-site-flow-template-shape-guard-validate:p2:inst-gitignore
  const gitignore = path.join(rootDir, '.gitignore');
  const gitignoreText = fs.existsSync(gitignore) ? fs.readFileSync(gitignore, 'utf8') : '';
  const bundleErrors = [...checkGitignoreBundles(gitignoreText, templateDirs), ...checkGitignoreVerifyPackages(gitignoreText, templateDirs)];
  for (const error of bundleErrors) {
    failed = true;
    logError(`[validate-templates] FAIL: ${error}`);
  }
  // @cpt-end:cpt-site-flow-template-shape-guard-validate:p2:inst-gitignore
  // @cpt-begin:cpt-site-flow-template-shape-guard-validate:p2:inst-validate-each
  for (const templateDir of templateDirs) {
    const templateName = path.basename(templateDir);
    const result = await validateCommand(templateDir, createFsReadFileFn(), createFsListContentOwnedFilesFn());
    const shapeErrors = checkTemplateShape(templateDir);
    if (result.ok && shapeErrors.length === 0) {
      log(`[validate-templates] PASS: ${templateName}`);
      continue;
    }
    // @cpt-end:cpt-site-flow-template-shape-guard-validate:p2:inst-validate-each
    // @cpt-begin:cpt-site-flow-template-shape-guard-validate:p2:inst-report-template
    failed = true;
    if (!result.ok) logError(`[validate-templates] FAIL: ${templateName} (frontx validate)\n${result.message}`);
    for (const error of shapeErrors) logError(`[validate-templates] FAIL: ${templateName}: ${error}`);
    // @cpt-end:cpt-site-flow-template-shape-guard-validate:p2:inst-report-template
  }
  // @cpt-begin:cpt-site-flow-template-shape-guard-validate:p2:inst-fail
  const count = `${templateDirs.length} template${templateDirs.length === 1 ? '' : 's'}`;
  if (failed) {
    logError(`[validate-templates] FAIL (${count})`);
    return 1;
  }
  // @cpt-end:cpt-site-flow-template-shape-guard-validate:p2:inst-fail
  // @cpt-begin:cpt-site-flow-template-shape-guard-validate:p2:inst-pass
  log(`[validate-templates] OK: ${count}`);
  return 0;
  // @cpt-end:cpt-site-flow-template-shape-guard-validate:p2:inst-pass
}

if (isEntryPoint(import.meta.url)) {
  // @cpt-begin:cpt-site-flow-template-shape-guard-validate:p2:inst-run
  process.exitCode = await runCli({ rootDir: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..') });
  // @cpt-end:cpt-site-flow-template-shape-guard-validate:p2:inst-run
}
