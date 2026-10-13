#!/usr/bin/env node
// Composes this repository's templates into site/: every path a template claims in `ownershipBoundaries.exclusiveSubtrees` is copied to the same path under site/ (build output and installs excluded). What it wrote is recorded with a sha256 per file in site/src-app/mfe_packages/.assembled.json, so a later run removes what no template claims any more and refuses to overwrite a path it did not create. `--check` reports drift both ways without writing, including every entry of site/src-app/mfe_packages/ (and of its shared/ folder) that no template claims; `--watch` re-assembles on template edits and keeps running when a step fails (a malformed manifest is reported, not thrown). template-shell's .gitignore keeps site/src-app/mfe_packages/* out of git; the root .gitignore does the same for the templates' AI bundles.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { findTemplateDirs, readTemplateManifest } from './template-discovery.mjs';
import { isEntryPoint } from './entry-point.mjs';

export const STATE_FILE = path.join('src-app', 'mfe_packages', '.assembled.json');
// Directories never copied from a template and never reported as drift in the site copy: installs, build and test output, and the Module Federation build cache.
export const IGNORED_DIRS = new Set(['node_modules', 'dist', 'coverage', '.vite', '.__mf__temp', '.mf']);
export const IGNORED_FILES = [/\.tsbuildinfo$/, /^\.DS_Store$/];
// The composition directory of the site and its shared folder: every entry there belongs to a claimed subtree, except the state file.
export const PACKAGES_DIR = 'src-app/mfe_packages';
export const SHARED_DIR = `${PACKAGES_DIR}/shared`;

const toPosix = (p) => p.split(path.sep).join('/');

function isIgnoredFile(name) {
  return IGNORED_FILES.some((pattern) => pattern.test(name));
}

/** @param {string} file */
export function sha256(file) {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

/**
 * Files under dir, relative to it (posix separators), skipping the ignored directories and files.
 * @param {string} dir
 * @returns {string[]}
 */
export function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const walk = (current, rel) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const childRel = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) walk(path.join(current, entry.name), childRel);
      } else if (entry.isFile() && !isIgnoredFile(entry.name)) {
        out.push(childRel);
      }
    }
  };
  walk(dir, '');
  return out.sort();
}

// @cpt-algo:cpt-site-algo-template-composition-desired-state:p1
/**
 * What the templates claim: site-relative file path -> { source, sha256, template }, and the claimed subtrees.
 * @param {string} rootDir
 */
export function desiredState(rootDir) {
  /** @type {Map<string, { source: string, sha256: string, template: string }>} */
  const files = new Map();
  /** @type {string[]} */
  const subtrees = [];
  const errors = [];
  // @cpt-begin:cpt-site-algo-template-composition-desired-state:p1:inst-normalize
  for (const templateDir of findTemplateDirs(rootDir)) {
    const template = path.basename(templateDir);
    const manifest = readTemplateManifest(templateDir);
    for (const subtree of manifest.ownershipBoundaries?.exclusiveSubtrees ?? []) {
      const normalized = toPosix(path.posix.normalize(subtree)).replace(/\/?$/, '/');
      // @cpt-end:cpt-site-algo-template-composition-desired-state:p1:inst-normalize
      // @cpt-begin:cpt-site-algo-template-composition-desired-state:p1:inst-leaves
      if (normalized.startsWith('../') || path.posix.isAbsolute(normalized)) {
        errors.push(`${template}: subtree ${subtree} leaves the template`);
        continue;
      }
      // @cpt-end:cpt-site-algo-template-composition-desired-state:p1:inst-leaves
      // @cpt-begin:cpt-site-algo-template-composition-desired-state:p1:inst-claim-files
      subtrees.push(normalized);
      for (const rel of listFiles(path.join(templateDir, normalized))) {
        const siteRel = `${normalized}${rel}`;
        const source = path.join(templateDir, normalized, rel);
        const previous = files.get(siteRel);
        if (previous) {
          errors.push(`${siteRel} is claimed by both ${previous.template} and ${template}`);
          continue;
        }
        files.set(siteRel, { source, sha256: sha256(source), template });
      }
      // @cpt-end:cpt-site-algo-template-composition-desired-state:p1:inst-claim-files
    }
  }
  // @cpt-begin:cpt-site-algo-template-composition-desired-state:p1:inst-return-desired
  return { files, subtrees: [...new Set(subtrees)].sort(), errors };
  // @cpt-end:cpt-site-algo-template-composition-desired-state:p1:inst-return-desired
}

/** @param {string} siteDir */
export function readState(siteDir) {
  const file = path.join(siteDir, STATE_FILE);
  if (!fs.existsSync(file)) return { files: {}, subtrees: [] };
  const state = JSON.parse(fs.readFileSync(file, 'utf8'));
  return { files: state.files ?? {}, subtrees: state.subtrees ?? [] };
}

/**
 * Files present in the site copy of the given subtrees.
 * @param {string} siteDir
 * @param {string[]} subtrees
 */
function siteFilesUnder(siteDir, subtrees) {
  const out = new Set();
  for (const subtree of subtrees) for (const rel of listFiles(path.join(siteDir, subtree))) out.add(`${subtree}${rel}`);
  return out;
}

/**
 * Entries of site/src-app/mfe_packages/ and of its shared/ folder that no claimed subtree covers (a leftover package, a stray file), as site-relative paths. The state file and the ignored names are not entries.
 * @param {string} siteDir
 * @param {string[]} subtrees - the claimed subtrees, each ending in `/`
 */
export function unclaimedEntries(siteDir, subtrees) {
  const claimed = new Set(subtrees);
  const out = [];
  const visit = (rel, isSharedRoot) => {
    const dir = path.join(siteDir, rel);
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const childRel = `${rel}/${entry.name}`;
      if (childRel === toPosix(STATE_FILE)) continue;
      if (entry.isDirectory() ? IGNORED_DIRS.has(entry.name) : isIgnoredFile(entry.name)) continue;
      if (entry.isDirectory() && claimed.has(`${childRel}/`)) continue;
      if (!isSharedRoot && entry.isDirectory() && childRel === SHARED_DIR) {
        visit(childRel, true);
        continue;
      }
      out.push(entry.isDirectory() ? `${childRel}/` : childRel);
    }
  };
  visit(PACKAGES_DIR, false);
  return out.sort();
}

// @cpt-algo:cpt-site-algo-template-composition-drift:p1
/**
 * Differences between the templates and the site copy, as site-relative paths.
 * @param {string} rootDir
 */
export function computeDrift(rootDir) {
  // @cpt-begin:cpt-site-algo-template-composition-drift:p1:inst-drift-read
  const siteDir = path.join(rootDir, 'site');
  const desired = desiredState(rootDir);
  const state = readState(siteDir);
  const present = siteFilesUnder(siteDir, [...new Set([...desired.subtrees, ...state.subtrees])]);
  const drift = [];
  // @cpt-end:cpt-site-algo-template-composition-drift:p1:inst-drift-read
  // @cpt-begin:cpt-site-algo-template-composition-drift:p1:inst-drift-claimed
  for (const [rel, want] of desired.files) {
    const dest = path.join(siteDir, rel);
    if (!fs.existsSync(dest)) drift.push({ path: rel, kind: 'missing in site' });
    else if (sha256(dest) !== want.sha256) drift.push({ path: rel, kind: 'differs from template' });
    else if (state.files[rel] !== want.sha256) drift.push({ path: rel, kind: 'not recorded in .assembled.json' });
  }
  // @cpt-end:cpt-site-algo-template-composition-drift:p1:inst-drift-claimed
  // @cpt-begin:cpt-site-algo-template-composition-drift:p1:inst-drift-present
  for (const rel of present) {
    if (desired.files.has(rel)) continue;
    drift.push({ path: rel, kind: rel in state.files ? 'no template claims it' : 'not in any template' });
  }
  // @cpt-end:cpt-site-algo-template-composition-drift:p1:inst-drift-present
  // @cpt-begin:cpt-site-algo-template-composition-drift:p1:inst-drift-recorded
  for (const rel of Object.keys(state.files)) {
    if (!desired.files.has(rel) && !present.has(rel)) drift.push({ path: rel, kind: 'recorded but absent' });
  }
  // @cpt-end:cpt-site-algo-template-composition-drift:p1:inst-drift-recorded
  // @cpt-begin:cpt-site-algo-template-composition-drift:p1:inst-drift-unclaimed
  for (const rel of unclaimedEntries(siteDir, desired.subtrees)) drift.push({ path: rel, kind: 'no template claims this entry' });
  // @cpt-end:cpt-site-algo-template-composition-drift:p1:inst-drift-unclaimed
  // @cpt-begin:cpt-site-algo-template-composition-drift:p1:inst-drift-return
  return { drift: drift.sort((a, b) => a.path.localeCompare(b.path)), errors: desired.errors };
  // @cpt-end:cpt-site-algo-template-composition-drift:p1:inst-drift-return
}

function removeEmptyDirs(dir, stopAt) {
  let current = dir;
  while (current.startsWith(stopAt) && current !== stopAt && fs.existsSync(current) && fs.readdirSync(current).length === 0) {
    fs.rmdirSync(current);
    current = path.dirname(current);
  }
}

// @cpt-flow:cpt-site-flow-template-composition-assemble:p1
// @cpt-dod:cpt-site-dod-template-composition-single-copy:p1
/**
 * Copies the templates into site/ and records the result.
 * @param {string} rootDir
 * @returns {{ written: string[], removed: string[], errors: string[] }}
 */
export function assemble(rootDir) {
  // @cpt-begin:cpt-site-flow-template-composition-assemble:p1:inst-site-missing
  const siteDir = path.join(rootDir, 'site');
  if (!fs.existsSync(siteDir)) return { written: [], removed: [], errors: ['site/ does not exist'] };
  // @cpt-end:cpt-site-flow-template-composition-assemble:p1:inst-site-missing
  // @cpt-begin:cpt-site-flow-template-composition-assemble:p1:inst-desired
  const desired = desiredState(rootDir);
  if (desired.errors.length > 0) return { written: [], removed: [], errors: desired.errors };
  // @cpt-end:cpt-site-flow-template-composition-assemble:p1:inst-desired
  // @cpt-begin:cpt-site-flow-template-composition-assemble:p1:inst-read-record
  const state = readState(siteDir);
  // @cpt-end:cpt-site-flow-template-composition-assemble:p1:inst-read-record
  // @cpt-begin:cpt-site-flow-template-composition-assemble:p1:inst-refuse
  const errors = [];
  // Refuse before writing anything: a desired path that exists but was not written by an earlier run, or a file inside a claimed subtree that no run wrote.
  const present = siteFilesUnder(siteDir, desired.subtrees);
  for (const rel of present) {
    if (rel in state.files) continue;
    if (desired.files.has(rel)) errors.push(`refusing to overwrite site/${rel}: it was not created by site:assemble`);
    else errors.push(`site/${rel} is inside a claimed subtree but in no template; move it into the template or delete it`);
  }
  if (errors.length > 0) return { written: [], removed: [], errors };
  // @cpt-end:cpt-site-flow-template-composition-assemble:p1:inst-refuse
  // @cpt-begin:cpt-site-flow-template-composition-assemble:p1:inst-copy
  const written = [];
  const removed = [];
  for (const [rel, want] of desired.files) {
    const dest = path.join(siteDir, rel);
    if (fs.existsSync(dest) && sha256(dest) === want.sha256) continue;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(want.source, dest);
    fs.chmodSync(dest, fs.statSync(want.source).mode);
    written.push(rel);
  }
  // @cpt-end:cpt-site-flow-template-composition-assemble:p1:inst-copy
  // @cpt-begin:cpt-site-flow-template-composition-assemble:p1:inst-remove-files
  for (const rel of Object.keys(state.files)) {
    if (desired.files.has(rel)) continue;
    const dest = path.join(siteDir, rel);
    if (fs.existsSync(dest)) {
      fs.rmSync(dest);
      removed.push(rel);
    }
    removeEmptyDirs(path.dirname(dest), siteDir);
  }
  // @cpt-end:cpt-site-flow-template-composition-assemble:p1:inst-remove-files
  // @cpt-begin:cpt-site-flow-template-composition-assemble:p1:inst-remove-subtrees
  for (const subtree of state.subtrees) {
    if (desired.subtrees.includes(subtree)) continue;
    const dir = path.join(siteDir, subtree);
    // A subtree no template claims any more goes with its build output and installs, which only it held.
    if (fs.existsSync(dir) && listFiles(dir).length === 0) fs.rmSync(dir, { recursive: true, force: true });
    removeEmptyDirs(path.dirname(dir), siteDir);
  }
  // @cpt-end:cpt-site-flow-template-composition-assemble:p1:inst-remove-subtrees
  // @cpt-begin:cpt-site-flow-template-composition-assemble:p1:inst-write-record
  const files = Object.fromEntries([...desired.files].map(([rel, want]) => [rel, want.sha256]));
  fs.mkdirSync(path.dirname(path.join(siteDir, STATE_FILE)), { recursive: true });
  fs.writeFileSync(path.join(siteDir, STATE_FILE), `${JSON.stringify({ subtrees: desired.subtrees, files }, null, 2)}\n`);
  // @cpt-end:cpt-site-flow-template-composition-assemble:p1:inst-write-record
  return { written: written.sort(), removed: removed.sort(), errors: [] };
}

/**
 * Runs one step and turns an exception (a malformed template manifest, an unreadable file) into a clear message and exit code 1, so `--watch` keeps running and reports the next edit.
 * @param {string} label
 * @param {() => number} step
 * @param {(line: string) => void} logError
 */
function guarded(label, step, logError) {
  try {
    return step();
  } catch (error) {
    // @cpt-begin:cpt-site-flow-template-composition-assemble:p1:inst-catch
    logError(`${label}: ${error instanceof Error ? error.message : String(error)}`);
    logError(`${label}: fix the template (for example its frontx-template.json), then run again`);
    return 1;
    // @cpt-end:cpt-site-flow-template-composition-assemble:p1:inst-catch
  }
}

function runOnce(rootDir, log, logError) {
  return guarded('site:assemble', () => {
    // @cpt-begin:cpt-site-flow-template-composition-assemble:p1:inst-report
    const result = assemble(rootDir);
    if (result.errors.length > 0) {
      for (const error of result.errors) logError(`site:assemble: ${error}`);
      return 1;
    }
    log(`site:assemble: ${result.written.length} written, ${result.removed.length} removed`);
    for (const rel of result.removed) log(`  removed site/${rel}`);
    return 0;
    // @cpt-end:cpt-site-flow-template-composition-assemble:p1:inst-report
  }, logError);
}

// @cpt-flow:cpt-site-flow-template-composition-check:p1
// @cpt-dod:cpt-site-dod-template-composition-drift-check:p1
function runCheck(rootDir, log, logError) {
  return guarded('site:assemble --check', () => {
    // @cpt-begin:cpt-site-flow-template-composition-check:p1:inst-check-compute
    const { drift, errors } = computeDrift(rootDir);
    // @cpt-end:cpt-site-flow-template-composition-check:p1:inst-check-compute
    // @cpt-begin:cpt-site-flow-template-composition-check:p1:inst-check-print
    for (const error of errors) logError(`site:assemble --check: ${error}`);
    for (const item of drift) logError(`site:assemble --check: site/${item.path}: ${item.kind}`);
    // @cpt-end:cpt-site-flow-template-composition-check:p1:inst-check-print
    // @cpt-begin:cpt-site-flow-template-composition-check:p1:inst-check-fail
    if (errors.length > 0 || drift.length > 0) {
      logError('site:assemble --check: site/ is out of sync with the templates; edit the template, then run npm run site:assemble');
      return 1;
    }
    // @cpt-end:cpt-site-flow-template-composition-check:p1:inst-check-fail
    // @cpt-begin:cpt-site-flow-template-composition-check:p1:inst-check-pass
    log('site:assemble --check: in sync');
    return 0;
    // @cpt-end:cpt-site-flow-template-composition-check:p1:inst-check-pass
  }, logError);
}

// @cpt-flow:cpt-site-flow-template-composition-watch:p2
// @cpt-dod:cpt-site-dod-template-composition-watch:p2
/**
 * @returns {() => void} stops watching
 */
function runWatch(rootDir, log, logError) {
  // @cpt-begin:cpt-site-flow-template-composition-watch:p2:inst-watch-initial
  runOnce(rootDir, log, logError);
  // @cpt-end:cpt-site-flow-template-composition-watch:p2:inst-watch-initial
  // @cpt-begin:cpt-site-flow-template-composition-watch:p2:inst-watch-templates
  let timer;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => runOnce(rootDir, log, logError), 200);
  };
  const watchers = findTemplateDirs(rootDir).map((templateDir) =>
    fs.watch(templateDir, { recursive: true }, (_event, file) => {
      const parts = toPosix(String(file ?? '')).split('/');
      if (!parts.some((part) => IGNORED_DIRS.has(part))) schedule();
    }),
  );
  log('site:assemble --watch: watching the templates; Ctrl+C to stop');
  // @cpt-end:cpt-site-flow-template-composition-watch:p2:inst-watch-templates
  // @cpt-begin:cpt-site-flow-template-composition-watch:p2:inst-watch-stop
  return () => {
    clearTimeout(timer);
    for (const watcher of watchers) watcher.close();
  };
  // @cpt-end:cpt-site-flow-template-composition-watch:p2:inst-watch-stop
}

/**
 * @param {string[]} argv
 * @param {{ rootDir?: string, log?: (line: string) => void, logError?: (line: string) => void, onWatch?: (stop: () => void) => void }} [options]
 */
export function main(argv, options = {}) {
  const rootDir = options.rootDir ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const log = options.log ?? console.log;
  const logError = options.logError ?? console.error;
  // @cpt-begin:cpt-site-flow-template-composition-check:p1:inst-check-run
  if (argv.includes('--check')) return runCheck(rootDir, log, logError);
  // @cpt-end:cpt-site-flow-template-composition-check:p1:inst-check-run
  // @cpt-begin:cpt-site-flow-template-composition-watch:p2:inst-watch-run
  if (argv.includes('--watch')) {
    const stop = runWatch(rootDir, log, logError);
    options.onWatch?.(stop);
    return undefined;
  }
  // @cpt-end:cpt-site-flow-template-composition-watch:p2:inst-watch-run
  // @cpt-begin:cpt-site-flow-template-composition-assemble:p1:inst-run
  return runOnce(rootDir, log, logError);
  // @cpt-end:cpt-site-flow-template-composition-assemble:p1:inst-run
}

if (isEntryPoint(import.meta.url)) {
  const code = main(process.argv.slice(2));
  if (code !== undefined) process.exitCode = code;
}
