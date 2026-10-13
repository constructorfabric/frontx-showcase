#!/usr/bin/env node
// Text policy of CONTRIBUTING.md ("Rules for repository content"): no long dash (U+2014, U+2013), no design-tool vendor name, no internal company domain and no former product name in the repository. The site is a Constructor Fabric property, so the company, its product names, its brand domain and its GitHub organization are allowed. Files are what git would record (`git ls-files --cached --others --exclude-standard`, so installs, build output and the composed copies under site/ are out). The long-dash rules hold in every such text file outside installs and build output: `.cf-studio/`, these policy files and every file the official templates applied to `site/` included (an applied file carries the long-dash adaptation of scripts/shell-changes.mjs). The other rules leave out `.cf-studio/` (Studio-owned), this policy's own rule and test files and the files the official templates applied to `site/` that the site has not changed, which stay as they ship apart from the adaptation; of `site/` they scan only the project's own files and the applied files the site changed or added. Lockfile integrity and resolved lines are skipped: a hash can match a name pattern by chance.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isEntryPoint } from './entry-point.mjs';
import { ownedAppliedFiles } from './shell-changes.mjs';

/** Repository-relative prefixes out of scope (a trailing `/` names a folder). */
export const EXCLUDED_PREFIXES = ['.cf-studio/', 'node_modules/'];
/** Directory names never scanned at any depth. */
export const EXCLUDED_DIRS = new Set(['node_modules', 'dist', 'coverage', '.git']);
/** The policy's own rule definitions and fixtures, which have to spell the names they refuse. */
export const EXCLUDED_FILES = ['scripts/policy-text.mjs', 'scripts/policy-text.test.mjs'];
/** The files of `site/` the project owns: its npm files and every applied template file the site changed or added (`scripts/shell-changes.mjs`); every other file there was applied by an official template as it ships, apart from the long-dash adaptation, and only the long-dash rules scan it. */
export const SITE_OWNED = [...new Set(['site/.npmrc', 'site/package.json', 'site/package-lock.json', ...ownedAppliedFiles()])];

/** What the policy refuses, with the message of each finding; a rule with `everywhere` holds in every scanned file (`inDashScope`), the others in the owned scope (`inScope`). */
export const RULES = [
  { pattern: /\u2014/, message: 'an em dash (U+2014); use "-"', everywhere: true },
  { pattern: /\u2013/, message: 'an en dash (U+2013); use "-"', everywhere: true },
  { pattern: /figma/i, message: 'a vendor name; describe the design source neutrally' },
  // Internal company domains (mail and internal hosts); the public brand domain constructor.rocks is allowed, and so is the company's public homepage written exactly as `https://constructor.tech/` (a mail address, a subdomain or any other address on the domain is still refused).
  { pattern: /(?<!(?<![\w.@/-])https:\/\/)constructor\.tech|(?<=(?<![\w.@/-])https:\/\/)constructor\.tech(?!\/(?:["'`\s)>\]]|$))/i, message: 'an internal company domain (constructor.tech)' },
  { pattern: /constructor\.dev/i, message: 'an internal company domain (constructor.dev)' },
  { pattern: /\bacv\b/i, message: 'a company-specific name (acv)' },
  // The npm scope and repository name `gears-frontx` are identifiers; the spaced form is a product name.
  { pattern: /\bgears frontx\b/i, message: 'a former product name; the product is FrontX' },
];

/** Lockfile lines that hold hashes and tarball URLs. */
const LOCKFILE_HASH_LINE = /^\s*"(?:integrity|resolved)":/;

/**
 * Whether a repository-relative path is in the long-dash rules' scope: every file but installs and build output.
 * @param {string} relativePath - `/` separators
 */
// @cpt-algo:cpt-site-algo-repository-policies-check-text:p3
export function inDashScope(relativePath) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-text:p3:inst-if-out-of-dash-scope
  return !relativePath.split('/').some((segment) => EXCLUDED_DIRS.has(segment));
  // @cpt-end:cpt-site-algo-repository-policies-check-text:p3:inst-if-out-of-dash-scope
}

/**
 * Whether a repository-relative path is in the owned scope of the other rules.
 * @param {string} relativePath - `/` separators
 */
export function inScope(relativePath) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-text:p3:inst-if-out-of-scope
  if (EXCLUDED_FILES.includes(relativePath)) return false;
  if (EXCLUDED_PREFIXES.some((prefix) => relativePath.startsWith(prefix))) return false;
  if (relativePath.split('/').some((segment) => EXCLUDED_DIRS.has(segment))) return false;
  if (relativePath.startsWith('site/')) return SITE_OWNED.includes(relativePath);
  return true;
  // @cpt-end:cpt-site-algo-repository-policies-check-text:p3:inst-if-out-of-scope
}

/**
 * Findings in one file's text.
 * @param {string} relativePath
 * @param {string} text
 * @param {typeof RULES} [rules] - the rules whose scope holds the file
 * @returns {string[]}
 */
export function checkText(relativePath, text, rules = RULES) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-text:p3:inst-check-lines
  const errors = [];
  const isLockfile = path.posix.basename(relativePath) === 'package-lock.json';
  text.split('\n').forEach((line, index) => {
    if (isLockfile && LOCKFILE_HASH_LINE.test(line)) return;
    for (const rule of rules) if (rule.pattern.test(line)) errors.push(`${relativePath}:${index + 1}: ${rule.message}`);
  });
  return errors;
  // @cpt-end:cpt-site-algo-repository-policies-check-text:p3:inst-check-lines
}

/**
 * The repository's files, relative and with `/` separators: what git would record, or, outside a git checkout, every file but the excluded directories.
 * @param {string} root
 * @returns {string[]}
 */
export function repositoryFiles(root) {
  // @cpt-begin:cpt-site-algo-repository-policies-check-text:p3:inst-list-files
  try {
    const out = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
    return [...new Set(out.split('\0').filter(Boolean))].sort();
  } catch {
    const files = [];
    const walk = (dir, rel) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (EXCLUDED_DIRS.has(entry.name)) continue;
        const childRel = rel ? `${rel}/${entry.name}` : entry.name;
        if (entry.isDirectory()) walk(path.join(dir, entry.name), childRel);
        else if (entry.isFile()) files.push(childRel);
      }
    };
    walk(root, '');
    return files.sort();
  }
  // @cpt-end:cpt-site-algo-repository-policies-check-text:p3:inst-list-files
}

/** Whether a file's content is binary (a NUL byte in its first 8 KiB). */
function isBinary(buffer) {
  return buffer.subarray(0, 8192).includes(0);
}

/**
 * @param {string} root
 * @returns {{ errors: string[], checked: number }}
 */
// @cpt-dod:cpt-site-dod-repository-policies-text-rules:p3
export function runPolicyText(root) {
  const errors = [];
  let checked = 0;
  // @cpt-begin:cpt-site-algo-repository-policies-check-text:p3:inst-list-files
  for (const relativePath of repositoryFiles(root)) {
    // @cpt-end:cpt-site-algo-repository-policies-check-text:p3:inst-list-files
    // @cpt-begin:cpt-site-algo-repository-policies-check-text:p3:inst-if-out-of-dash-scope
    if (!inDashScope(relativePath)) continue;
    // @cpt-end:cpt-site-algo-repository-policies-check-text:p3:inst-if-out-of-dash-scope
    // @cpt-begin:cpt-site-algo-repository-policies-check-text:p3:inst-if-out-of-scope
    const rules = inScope(relativePath) ? RULES : RULES.filter((rule) => rule.everywhere);
    // @cpt-end:cpt-site-algo-repository-policies-check-text:p3:inst-if-out-of-scope
    // @cpt-begin:cpt-site-algo-repository-policies-check-text:p3:inst-if-binary
    const file = path.join(root, relativePath);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
    const buffer = fs.readFileSync(file);
    if (isBinary(buffer)) continue;
    // @cpt-end:cpt-site-algo-repository-policies-check-text:p3:inst-if-binary
    // @cpt-begin:cpt-site-algo-repository-policies-check-text:p3:inst-check-lines
    checked += 1;
    errors.push(...checkText(relativePath, buffer.toString('utf8'), rules));
    // @cpt-end:cpt-site-algo-repository-policies-check-text:p3:inst-check-lines
  }
  // @cpt-begin:cpt-site-algo-repository-policies-check-text:p3:inst-return-text-result
  return { errors, checked };
  // @cpt-end:cpt-site-algo-repository-policies-check-text:p3:inst-return-text-result
}

// @cpt-flow:cpt-site-flow-repository-policies-run-policy:p3
if (isEntryPoint(import.meta.url)) {
  // @cpt-begin:cpt-site-flow-repository-policies-run-policy:p3:inst-run-policy
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const { errors, checked } = runPolicyText(root);
  // @cpt-end:cpt-site-flow-repository-policies-run-policy:p3:inst-run-policy
  // @cpt-begin:cpt-site-flow-repository-policies-run-policy:p3:inst-if-findings
  if (errors.length > 0) {
    for (const error of errors) console.error(`policy:text: ${error}`);
    process.exit(1);
  }
  // @cpt-end:cpt-site-flow-repository-policies-run-policy:p3:inst-if-findings
  // @cpt-begin:cpt-site-flow-repository-policies-run-policy:p3:inst-report-checked
  console.log(`policy:text: ${checked} files have no long dash, and the owned ones no vendor name, internal domain or former product name`);
  // @cpt-end:cpt-site-flow-repository-policies-run-policy:p3:inst-report-checked
}
