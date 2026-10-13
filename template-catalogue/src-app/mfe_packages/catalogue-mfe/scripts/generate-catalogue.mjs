#!/usr/bin/env node
// Generates the catalogue's example files, foundation pages and `shared.tsx` from the ui-kit demo of the pinned `@gears-frontx/ui-kit` release: the demo files listed in `kit-demo/kit-demo.lock.json`, at the gears-frontx commit the release was published from, each passed through the content rules below and then through its adaptation (`kit-demo/adaptations/<file>.patch`, a strict unified diff with its kind and reason). The output is stored in the package; `--check` regenerates it and fails on any difference, on a pin that differs from the locked kit version, on a source file whose hash differs from the lock, or on an adaptation that no longer applies.
//
// Usage (from the package directory):
//   node scripts/generate-catalogue.mjs                  regenerate from the locked source
//   node scripts/generate-catalogue.mjs --check          regenerate in memory and compare
//   node scripts/generate-catalogue.mjs --ref <commit>   move to the commit the newly pinned kit version was published from; a file whose adaptation no longer applies is written as the new source and reported, with its adaptation left in place to port
//   node scripts/generate-catalogue.mjs --record [file]  store the current edit of a generated file (or of all) as its adaptation, against the locked commit; with `--ref <commit>` the lock must already name that commit
//   --source <dir>  read the demo from a local checkout's `packages/ui-kit/demo` instead of the network or the cache
//
// A fetched demo file is cached only once its SHA-256 matches the lock (written through a temporary file and a rename), and a cached file that does not match is fetched again, so a bad answer (a proxy page, a cut transfer) never sticks. `--ref` caches what it fetches, since that content is what the new lock records.
//
// Only Node built-ins and this package's own files are used, so the package stays self-contained.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export const PACKAGE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const LOCK_FILE = 'kit-demo/kit-demo.lock.json';
export const ADAPTATIONS_DIR = 'kit-demo/adaptations';
/** Where a demo file lands in the package: `examples/button.tsx` becomes `src/examples/button.tsx`. */
export const OUTPUT_ROOT = 'src';
/** Generated folders the generator owns whole: a file there that it does not produce is an error. */
export const OWNED_DIRS = ['examples', 'pages'];
/** Where fetched demo files are cached, per commit, inside the package's own install folder. */
export const CACHE_DIR = 'node_modules/.cache/catalogue-kit-demo';
export const KIT_PACKAGE = '@gears-frontx/ui-kit';
/** The adaptation kinds: `mechanical` keeps the behaviour and only meets a site rule (lint, links that stay on the page, neutral wording); `substantive` changes what the page does or shows. */
export const ADAPTATION_KINDS = ['mechanical', 'substantive'];

/*
 * Content rules, applied to every demo file before its adaptation. The
 * repository refuses long dashes, the design tool's vendor name and the
 * company's internal domains in any file (CONTRIBUTING.md, `policy:text`);
 * the kit's demo has all three. The vendor name is written with an escape
 * so this file itself carries none of the refused text.
 */
export const CONTENT_RULES = [
  { id: 'long-dash', description: 'long dashes become "-"', pattern: /[\u2013\u2014]/g, replace: '-' },
  { id: 'design-source-board', description: "the vendor's foundations mockup becomes the design source's foundations", pattern: /\x46igma(\s+(?:\*\s+)?)foundations mockup's/g, replace: "design$1source's foundations" },
  { id: 'design-source', description: "the vendor's name becomes the design source", pattern: /\x46igma's/g, replace: "the design source's" },
  { id: 'example-domain', description: 'internal mail addresses move to example.com', pattern: /@constructor\.dev\b/g, replace: '@example.com' },
];

/** What generated text may never hold; a hit means a content rule or an adaptation is missing. */
export const REFUSED_CONTENT = [
  { pattern: /[\u2013\u2014]/, message: 'a long dash' },
  { pattern: /\x66igma/i, message: 'the design tool vendor name' },
  { pattern: /constructor\.(?:dev|tech)\b/i, message: 'an internal company domain' },
];

/** @param {string} text */
export function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

/**
 * A demo file after the content rules.
 * @param {string} text
 */
export function applyContentRules(text) {
  return CONTENT_RULES.reduce((current, rule) => current.replace(rule.pattern, rule.replace), text);
}

/**
 * Lines of a text that ends with one newline.
 * @param {string} text
 * @param {string} label
 */
function toLines(text, label) {
  if (text === '') return [];
  if (!text.endsWith('\n')) throw new Error(`${label}: the text must end with a newline`);
  return text.slice(0, -1).split('\n');
}

/** @param {string[]} lines */
function fromLines(lines) {
  return lines.length === 0 ? '' : `${lines.join('\n')}\n`;
}

/**
 * The header of an adaptation: its `Kind:` and `Reason:` lines, before the diff.
 * @param {string} patchText
 */
export function parseAdaptationHeader(patchText) {
  const header = patchText.split('\n--- ')[0];
  const kind = /^Kind: (.+)$/m.exec(header)?.[1]?.trim();
  const reason = /^Reason: (.+)$/m.exec(header)?.[1]?.trim();
  return { kind, reason };
}

/**
 * The hunks of a unified diff.
 * @param {string} patchText
 * @param {string} label
 */
export function parsePatch(patchText, label) {
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-apply-adaptation:p1:inst-parse-hunks
  const lines = patchText.split('\n');
  if (lines.at(-1) === '') lines.pop();
  const start = lines.findIndex((line) => line.startsWith('--- '));
  if (start === -1 || !lines[start + 1]?.startsWith('+++ ')) throw new Error(`${label}: no unified diff header (--- / +++)`);
  const hunks = [];
  let hunk;
  for (const line of lines.slice(start + 2)) {
    const head = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(line);
    if (head) {
      hunk = { oldStart: Number(head[1]), oldLines: [], newLines: [] };
      hunks.push(hunk);
      continue;
    }
    if (!hunk) throw new Error(`${label}: a line before the first hunk: ${line}`);
    if (line.startsWith('\\')) throw new Error(`${label}: "No newline at end of file" is not supported`);
    const body = line.slice(1);
    if (line.startsWith(' ') || line === '') {
      hunk.oldLines.push(body);
      hunk.newLines.push(body);
    } else if (line.startsWith('-')) hunk.oldLines.push(body);
    else if (line.startsWith('+')) hunk.newLines.push(body);
    else throw new Error(`${label}: an unexpected diff line: ${line}`);
  }
  if (hunks.length === 0) throw new Error(`${label}: the diff has no hunks`);
  return hunks;
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-apply-adaptation:p1:inst-parse-hunks
}

/**
 * @param {string[]} lines
 * @param {string[]} block
 * @param {number} at
 */
function matchesAt(lines, block, at) {
  if (at < 0 || at + block.length > lines.length) return false;
  return block.every((line, index) => lines[at + index] === line);
}

/**
 * Applies a unified diff without fuzz: each hunk's old lines must appear exactly as written, at the line the hunk names or, when the source moved, at one place only after the previous hunk. Anything else fails, so an upstream change under an adaptation is reported instead of guessed at.
 * @param {string} text
 * @param {string} patchText
 * @param {string} label
 */
// @cpt-algo:cpt-template-catalogue-algo-catalogue-generation-apply-adaptation:p1
export function applyPatch(text, patchText, label) {
  const lines = toLines(text, label);
  const result = [];
  let cursor = 0;
  let offset = 0;
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-apply-adaptation:p1:inst-each-hunk
  parsePatch(patchText, label).forEach((hunk, index) => {
    // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-apply-adaptation:p1:inst-match-at-line
    const expected = hunk.oldStart - 1 + offset;
    let at = -1;
    if (expected >= cursor && matchesAt(lines, hunk.oldLines, expected)) at = expected;
    // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-apply-adaptation:p1:inst-match-at-line
    // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-apply-adaptation:p1:inst-match-once
    else {
      const found = [];
      for (let candidate = cursor; candidate + hunk.oldLines.length <= lines.length; candidate += 1) {
        if (matchesAt(lines, hunk.oldLines, candidate)) found.push(candidate);
      }
      if (found.length !== 1) throw new Error(`${label}: hunk ${index + 1} (line ${hunk.oldStart}) ${found.length === 0 ? 'no longer matches the source' : `matches the source ${found.length} times`}; port the adaptation to the new source and record it again (--record)`);
      at = found[0];
    }
    // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-apply-adaptation:p1:inst-match-once
    // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-apply-adaptation:p1:inst-splice-hunk
    result.push(...lines.slice(cursor, at), ...hunk.newLines);
    cursor = at + hunk.oldLines.length;
    offset = at - (hunk.oldStart - 1);
    // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-apply-adaptation:p1:inst-splice-hunk
  });
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-apply-adaptation:p1:inst-each-hunk
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-apply-adaptation:p1:inst-return-adapted
  result.push(...lines.slice(cursor));
  return fromLines(result);
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-apply-adaptation:p1:inst-return-adapted
}

/**
 * The edit script between two line lists (longest common subsequence).
 * @param {string[]} a
 * @param {string[]} b
 * @returns {Array<{ op: ' ' | '-' | '+', line: string }>}
 */
function diffLines(a, b) {
  const width = b.length + 1;
  const table = new Uint32Array((a.length + 1) * width);
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i * width + j] = a[i] === b[j] ? table[(i + 1) * width + j + 1] + 1 : Math.max(table[(i + 1) * width + j], table[i * width + j + 1]);
    }
  }
  const ops = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      ops.push({ op: ' ', line: a[i] });
      i += 1;
      j += 1;
    } else if (table[(i + 1) * width + j] >= table[i * width + j + 1]) {
      ops.push({ op: '-', line: a[i] });
      i += 1;
    } else {
      ops.push({ op: '+', line: b[j] });
      j += 1;
    }
  }
  while (i < a.length) ops.push({ op: '-', line: a[i++] });
  while (j < b.length) ops.push({ op: '+', line: b[j++] });
  return ops;
}

/**
 * A unified diff (three lines of context) from one text to another, or `undefined` when they are equal.
 * @param {string} oldText
 * @param {string} newText
 * @param {string} file - the demo-relative path named in the diff header
 */
// @cpt-algo:cpt-template-catalogue-algo-catalogue-generation-create-diff:p2
export function createPatch(oldText, newText, file) {
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-create-diff:p2:inst-equal-texts
  if (oldText === newText) return undefined;
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-create-diff:p2:inst-equal-texts
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-create-diff:p2:inst-edit-script
  const ops = diffLines(toLines(oldText, file), toLines(newText, file));
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-create-diff:p2:inst-edit-script
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-create-diff:p2:inst-group-changes
  const CONTEXT = 3;
  const changed = ops.map((entry, index) => (entry.op === ' ' ? -1 : index)).filter((index) => index !== -1);
  const groups = [];
  for (const index of changed) {
    const last = groups.at(-1);
    if (last && index - last.end <= CONTEXT * 2 + 1) last.end = index;
    else groups.push({ start: index, end: index });
  }
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-create-diff:p2:inst-group-changes
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-create-diff:p2:inst-write-hunks
  const out = [`--- a/${file}`, `+++ b/${file}`];
  for (const group of groups) {
    const from = Math.max(0, group.start - CONTEXT);
    const to = Math.min(ops.length - 1, group.end + CONTEXT);
    let oldLine = 1;
    let newLine = 1;
    for (const entry of ops.slice(0, from)) {
      if (entry.op !== '+') oldLine += 1;
      if (entry.op !== '-') newLine += 1;
    }
    const slice = ops.slice(from, to + 1);
    const oldCount = slice.filter((entry) => entry.op !== '+').length;
    const newCount = slice.filter((entry) => entry.op !== '-').length;
    out.push(`@@ -${oldCount === 0 ? oldLine - 1 : oldLine},${oldCount} +${newCount === 0 ? newLine - 1 : newLine},${newCount} @@`);
    for (const entry of slice) out.push(`${entry.op}${entry.line}`);
  }
  return `${out.join('\n')}\n`;
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-create-diff:p2:inst-write-hunks
}

/**
 * The generated files from the demo sources and the adaptations.
 * @param {Map<string, string>} sources - demo-relative path to text
 * @param {Map<string, string>} adaptations - demo-relative path to patch text
 * @param {{ unported?: string[] }} [options] - with `unported`, an adaptation that no longer applies is collected there and its file is generated without it (the new source after the content rules), instead of failing the whole generation
 * @returns {Map<string, string>} package-relative path to text
 */
// @cpt-algo:cpt-template-catalogue-algo-catalogue-generation-generate-files:p1
export function generateFiles(sources, adaptations, { unported } = {}) {
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-generate-files:p1:inst-refuse-orphan-adaptation
  for (const file of adaptations.keys()) if (!sources.has(file)) throw new Error(`adaptation ${file}.patch names a file the kit demo does not have`);
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-generate-files:p1:inst-refuse-orphan-adaptation
  const output = new Map();
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-generate-files:p1:inst-each-source
  for (const [file, text] of [...sources].sort(([a], [b]) => a.localeCompare(b))) {
    // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-generate-files:p1:inst-content-rules
    let result = applyContentRules(text);
    // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-generate-files:p1:inst-content-rules
    // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-generate-files:p1:inst-if-adaptation
    const patch = adaptations.get(file);
    if (patch !== undefined) {
      // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-generate-files:p1:inst-require-kind-reason
      const { kind, reason } = parseAdaptationHeader(patch);
      if (!ADAPTATION_KINDS.includes(kind ?? '')) throw new Error(`adaptation ${file}.patch: Kind must be one of ${ADAPTATION_KINDS.join(', ')}`);
      if (!reason || reason.startsWith('TODO')) throw new Error(`adaptation ${file}.patch: give the reason on its Reason: line`);
      // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-generate-files:p1:inst-require-kind-reason
      // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-generate-files:p1:inst-apply-adaptation
      try {
        result = applyPatch(result, patch, `adaptation ${file}.patch`);
      // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-generate-files:p1:inst-apply-adaptation
      // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-generate-files:p1:inst-collect-unported
      } catch (error) {
        if (!unported) throw error;
        unported.push(error instanceof Error ? error.message : String(error));
        output.set(`${OUTPUT_ROOT}/${file}`, result);
        continue;
      }
      // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-generate-files:p1:inst-collect-unported
    }
    // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-generate-files:p1:inst-if-adaptation
    // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-generate-files:p1:inst-refuse-survivors
    result.split('\n').forEach((line, index) => {
      for (const rule of REFUSED_CONTENT) if (rule.pattern.test(line)) throw new Error(`${file}:${index + 1}: ${rule.message} survives the content rules; add a content rule or an adaptation`);
    });
    // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-generate-files:p1:inst-refuse-survivors
    // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-generate-files:p1:inst-emit-file
    output.set(`${OUTPUT_ROOT}/${file}`, result);
    // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-generate-files:p1:inst-emit-file
  }
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-generate-files:p1:inst-each-source
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-generate-files:p1:inst-return-files
  return output;
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-generate-files:p1:inst-return-files
}

/**
 * Whether a demo-relative path is one the catalogue takes, per the lock's `include` patterns (`dir/*.ext` or a plain path).
 * @param {string} file
 * @param {string[]} include
 */
export function isIncluded(file, include) {
  return include.some((pattern) => {
    if (!pattern.includes('*')) return file === pattern;
    const [dir, rest] = [path.posix.dirname(pattern), path.posix.basename(pattern)];
    return path.posix.dirname(file) === dir && path.posix.basename(file).endsWith(rest.replace('*', ''));
  });
}

/** @param {string} packageDir */
export function readLock(packageDir) {
  return JSON.parse(fs.readFileSync(path.join(packageDir, LOCK_FILE), 'utf8'));
}

/** The kit version the package pins, exactly. @param {string} packageDir */
export function pinnedKitVersion(packageDir) {
  const pkg = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
  const version = pkg.dependencies?.[KIT_PACKAGE];
  if (!/^\d+\.\d+\.\d+(?:-[\w.]+)?$/.test(version ?? '')) throw new Error(`package.json must pin ${KIT_PACKAGE} to an exact version, found ${version}`);
  return version;
}

/** @param {string} packageDir */
export function readAdaptations(packageDir) {
  const dir = path.join(packageDir, ADAPTATIONS_DIR);
  const adaptations = new Map();
  if (!fs.existsSync(dir)) return adaptations;
  const walk = (current, rel) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const childRel = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(path.join(current, entry.name), childRel);
      else if (entry.name.endsWith('.patch')) adaptations.set(childRel.slice(0, -'.patch'.length), fs.readFileSync(path.join(current, entry.name), 'utf8'));
    }
  };
  walk(dir, '');
  return adaptations;
}

/**
 * The generated files present on disk, package-relative: everything in the owned folders, plus the listed files outside them.
 * @param {string} packageDir
 * @param {string[]} files - package-relative
 */
export function readGeneratedOnDisk(packageDir, files) {
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-compare-stored:p1:inst-read-stored
  const onDisk = new Map();
  for (const dir of OWNED_DIRS) {
    const abs = path.join(packageDir, OUTPUT_ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const name of fs.readdirSync(abs)) onDisk.set(`${OUTPUT_ROOT}/${dir}/${name}`, fs.readFileSync(path.join(abs, name), 'utf8'));
  }
  for (const file of files) {
    if (onDisk.has(file)) continue;
    const abs = path.join(packageDir, file);
    if (fs.existsSync(abs)) onDisk.set(file, fs.readFileSync(abs, 'utf8'));
  }
  return onDisk;
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-compare-stored:p1:inst-read-stored
}

const LOCAL_HINT = 'check the network, or read a local checkout with --source <checkout>/packages/ui-kit/demo';

/** @param {string} url @param {typeof fetch} fetchImpl */
// @cpt-algo:cpt-template-catalogue-algo-catalogue-generation-fetch-text:p2
async function fetchText(url, fetchImpl) {
  let response;
  let text;
  try {
    // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-fetch-text:p2:inst-get
    response = await fetchImpl(url);
    if (response.ok) text = await response.text();
    // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-fetch-text:p2:inst-get
  } catch (error) {
    // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-fetch-text:p2:inst-network-failure
    throw new Error(`GET ${url}: ${error instanceof Error ? error.message : String(error)}; ${LOCAL_HINT}`);
    // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-fetch-text:p2:inst-network-failure
  }
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-fetch-text:p2:inst-http-failure
  if (!response.ok || text === undefined) throw new Error(`GET ${url}: HTTP ${response.status}; ${LOCAL_HINT}`);
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-fetch-text:p2:inst-http-failure
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-fetch-text:p2:inst-return-text
  return text;
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-fetch-text:p2:inst-return-text
}

/**
 * Writes a cache entry whole or not at all: to a temporary file next to it, then renamed over it.
 * @param {string} file @param {string} text
 */
function writeCacheEntry(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, text);
  fs.renameSync(temporary, file);
}

/**
 * The demo files of a source description, from a local checkout, the cache or the network, in that order. With `expected` hashes a cached file that does not match is fetched again, and a fetched file is cached only when it matches; a fetched file that does not match fails with its address.
 * @param {{ repository: string, ref: string, path: string }} source
 * @param {string[]} files - demo-relative paths
 * @param {{ packageDir: string, sourceDir?: string, fetchImpl?: typeof fetch, expected?: Record<string, string> }} options - `expected`: demo-relative path to SHA-256, the lock's hashes
 */
// @cpt-algo:cpt-template-catalogue-algo-catalogue-generation-load-sources:p1
// @cpt-state:cpt-template-catalogue-state-catalogue-generation-cache-entry:p2
export async function loadSources(source, files, { packageDir, sourceDir, fetchImpl = fetch, expected }) {
  const sources = new Map();
  const cache = path.join(packageDir, CACHE_DIR, source.ref);
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-load-sources:p1:inst-each-file
  for (const file of files) {
    // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-load-sources:p1:inst-read-checkout
    if (sourceDir) {
      sources.set(file, fs.readFileSync(path.join(sourceDir, file), 'utf8'));
      continue;
    }
    // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-load-sources:p1:inst-read-checkout
    // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-load-sources:p1:inst-read-cache
    const entry = path.join(cache, file);
    const hash = expected?.[file];
    let text;
    if (fs.existsSync(entry)) {
      text = fs.readFileSync(entry, 'utf8');
      if (hash !== undefined && sha256(text) !== hash) {
        // @cpt-begin:cpt-template-catalogue-state-catalogue-generation-cache-entry:p2:inst-entry-dropped
        fs.rmSync(entry);
        text = undefined;
        // @cpt-end:cpt-template-catalogue-state-catalogue-generation-cache-entry:p2:inst-entry-dropped
      }
    }
    // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-load-sources:p1:inst-read-cache
    if (text === undefined) {
      // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-load-sources:p1:inst-fetch-file
      const url = `https://raw.githubusercontent.com/${source.repository}/${source.ref}/${source.path}/${file}`;
      text = await fetchText(url, fetchImpl);
      if (hash !== undefined && sha256(text) !== hash) throw new Error(`GET ${url}: the answer does not match the hash of kit demo ${file} in ${LOCK_FILE}, so it was not cached (a proxy or portal page, or a cut transfer); ${LOCAL_HINT}`);
      // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-load-sources:p1:inst-fetch-file
      // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-load-sources:p1:inst-cache-file
      // @cpt-begin:cpt-template-catalogue-state-catalogue-generation-cache-entry:p2:inst-entry-cached
      writeCacheEntry(entry, text);
      // @cpt-end:cpt-template-catalogue-state-catalogue-generation-cache-entry:p2:inst-entry-cached
      // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-load-sources:p1:inst-cache-file
    }
    sources.set(file, text);
  }
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-load-sources:p1:inst-each-file
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-load-sources:p1:inst-return-sources
  return sources;
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-load-sources:p1:inst-return-sources
}

/**
 * The demo files at a new commit and the kit version declared there.
 * @param {{ repository: string, ref: string, path: string }} source
 * @param {string[]} include
 * @param {{ sourceDir?: string, fetchImpl?: typeof fetch }} options
 */
// @cpt-algo:cpt-template-catalogue-algo-catalogue-generation-list-at-commit:p1
// @cpt-dod:cpt-template-catalogue-dod-catalogue-generation-move:p1
export async function listSourceAt(source, include, { sourceDir, fetchImpl = fetch }) {
  let files;
  let kitVersion;
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-list-at-commit:p1:inst-list-checkout
  if (sourceDir) {
    files = [];
    const walk = (current, rel) => {
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const childRel = rel ? `${rel}/${entry.name}` : entry.name;
        if (entry.isDirectory()) walk(path.join(current, entry.name), childRel);
        else files.push(childRel);
      }
    };
    walk(sourceDir, '');
    kitVersion = JSON.parse(fs.readFileSync(path.join(sourceDir, '..', 'package.json'), 'utf8')).version;
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-list-at-commit:p1:inst-list-checkout
  } else {
    // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-list-at-commit:p1:inst-list-remote
    const tree = JSON.parse(await fetchText(`https://api.github.com/repos/${source.repository}/git/trees/${source.ref}:${source.path}?recursive=1`, fetchImpl));
    files = tree.tree.filter((entry) => entry.type === 'blob').map((entry) => entry.path);
    const kitPackagePath = path.posix.join(path.posix.dirname(source.path), 'package.json');
    kitVersion = JSON.parse(await fetchText(`https://raw.githubusercontent.com/${source.repository}/${source.ref}/${kitPackagePath}`, fetchImpl)).version;
    // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-list-at-commit:p1:inst-list-remote
  }
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-list-at-commit:p1:inst-filter-included
  return { files: files.filter((file) => isIncluded(file, include)).sort(), kitVersion };
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-list-at-commit:p1:inst-filter-included
}

/**
 * Differences between the generated files and the files on disk.
 * @param {Map<string, string>} expected
 * @param {Map<string, string>} onDisk
 */
// @cpt-algo:cpt-template-catalogue-algo-catalogue-generation-compare-stored:p1
export function compareGenerated(expected, onDisk) {
  const problems = [];
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-compare-stored:p1:inst-missing-or-different
  for (const [file, text] of expected) {
    if (!onDisk.has(file)) problems.push(`${file}: missing`);
    else if (onDisk.get(file) !== text) problems.push(`${file}: differs from what the generator produces`);
  }
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-compare-stored:p1:inst-missing-or-different
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-compare-stored:p1:inst-not-produced
  for (const file of onDisk.keys()) if (!expected.has(file)) problems.push(`${file}: not produced by the generator`);
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-compare-stored:p1:inst-not-produced
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-compare-stored:p1:inst-return-sorted
  return problems.sort();
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-compare-stored:p1:inst-return-sorted
}

/**
 * Verifies the lock against the pin and the sources against the lock's hashes.
 * @param {ReturnType<typeof readLock>} lock
 * @param {string} pinned
 * @param {Map<string, string>} sources
 */
// @cpt-algo:cpt-template-catalogue-algo-catalogue-generation-verify-lock:p1
export function lockProblems(lock, pinned, sources) {
  const problems = [];
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-verify-lock:p1:inst-pin-differs
  if (lock.kit.version !== pinned) problems.push(`package.json pins ${KIT_PACKAGE} ${pinned}, the catalogue was generated from ${lock.kit.version}; run the generator with --ref <the commit ${pinned} was published from>`);
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-verify-lock:p1:inst-pin-differs
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-verify-lock:p1:inst-hash-differs
  for (const [file, text] of sources) if (lock.files[file] !== sha256(text)) problems.push(`kit demo ${file}: its content does not match the hash in ${LOCK_FILE}`);
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-verify-lock:p1:inst-hash-differs
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-generation-verify-lock:p1:inst-return-problems
  return problems;
  // @cpt-end:cpt-template-catalogue-algo-catalogue-generation-verify-lock:p1:inst-return-problems
}

/**
 * `--check`: everything that makes the stored catalogue differ from a fresh generation.
 * @param {{ packageDir?: string, sourceDir?: string, fetchImpl?: typeof fetch }} options
 * @returns {Promise<string[]>}
 */
// @cpt-flow:cpt-template-catalogue-flow-catalogue-generation-check:p1
// @cpt-dod:cpt-template-catalogue-dod-catalogue-generation-check:p1
export async function checkCatalogue({ packageDir = PACKAGE_DIR, sourceDir, fetchImpl } = {}) {
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-check:p1:inst-load-locked
  const lock = readLock(packageDir);
  const pinned = pinnedKitVersion(packageDir);
  const sources = await loadSources(lock.source, Object.keys(lock.files), { packageDir, sourceDir, fetchImpl, expected: lock.files });
  // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-check:p1:inst-load-locked
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-check:p1:inst-return-lock-problems
  const problems = lockProblems(lock, pinned, sources);
  if (problems.length > 0) return problems;
  // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-check:p1:inst-return-lock-problems
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-check:p1:inst-generate-in-memory
  let expected;
  try {
    expected = generateFiles(sources, readAdaptations(packageDir));
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)];
  }
  // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-check:p1:inst-generate-in-memory
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-check:p1:inst-compare-stored
  return compareGenerated(expected, readGeneratedOnDisk(packageDir, [...expected.keys()]));
  // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-check:p1:inst-compare-stored
}

/** @param {string} packageDir @param {Map<string, string>} files */
function writeGenerated(packageDir, files) {
  for (const file of readGeneratedOnDisk(packageDir, []).keys()) if (!files.has(file)) fs.rmSync(path.join(packageDir, file));
  for (const [file, text] of files) {
    fs.mkdirSync(path.dirname(path.join(packageDir, file)), { recursive: true });
    fs.writeFileSync(path.join(packageDir, file), text);
  }
}

/**
 * Regenerates the stored catalogue; with `ref`, from a new commit, after checking the kit version declared there equals the pin. Every file is written and the lock moves even when an adaptation no longer applies: that file is written as the new source after the content rules, its adaptation stays as it is, and the failure is returned in `unported`, so the edit can be redone on the new source and recorded (`recordAdaptations`).
 * @param {{ packageDir?: string, sourceDir?: string, ref?: string, fetchImpl?: typeof fetch }} options
 * @returns {Promise<{ files: Map<string, string>, unported: string[] }>}
 */
// @cpt-flow:cpt-template-catalogue-flow-catalogue-generation-generate:p1
// @cpt-dod:cpt-template-catalogue-dod-catalogue-generation-reproducible-files:p1
export async function generateCatalogue({ packageDir = PACKAGE_DIR, sourceDir, ref, fetchImpl } = {}) {
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-read-lock-and-pin
  const lock = readLock(packageDir);
  const pinned = pinnedKitVersion(packageDir);
  let sources;
  // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-read-lock-and-pin
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-if-new-commit
  if (ref !== undefined && ref !== lock.source.ref) {
    // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-list-at-commit
    const listed = await listSourceAt({ ...lock.source, ref }, lock.include, { sourceDir, fetchImpl });
    // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-list-at-commit
    // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-refuse-other-version
    if (listed.kitVersion !== pinned) throw new Error(`${ref} declares ${KIT_PACKAGE} ${listed.kitVersion}, package.json pins ${pinned}; name the commit ${pinned} was published from`);
    // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-refuse-other-version
    // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-move-lock
    lock.source.ref = ref;
    lock.kit.version = pinned;
    // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-move-lock
    // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-load-new-sources
    sources = await loadSources(lock.source, listed.files, { packageDir, sourceDir, fetchImpl });
    lock.files = Object.fromEntries([...sources].map(([file, text]) => [file, sha256(text)]));
    // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-load-new-sources
    // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-if-new-commit
  } else {
    // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-else-locked-commit
    // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-refuse-unmoved-pin
    if (lock.kit.version !== pinned) throw new Error(`package.json pins ${KIT_PACKAGE} ${pinned}, the lock names ${lock.kit.version}; run with --ref <the commit ${pinned} was published from>`);
    // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-refuse-unmoved-pin
    // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-load-locked-sources
    sources = await loadSources(lock.source, Object.keys(lock.files), { packageDir, sourceDir, fetchImpl, expected: lock.files });
    // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-load-locked-sources
    // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-else-locked-commit
  }
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-verify-lock
  const problems = lockProblems(lock, pinned, sources);
  if (problems.length > 0) throw new Error(problems.join('\n'));
  // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-verify-lock
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-generate-files
  const unported = [];
  const generated = generateFiles(sources, readAdaptations(packageDir), { unported });
  // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-generate-files
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-write-files
  writeGenerated(packageDir, generated);
  fs.writeFileSync(path.join(packageDir, LOCK_FILE), `${JSON.stringify(lock, null, 2)}\n`);
  // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-write-files
  return { files: generated, unported };
}

/**
 * Stores the current text of generated files as their adaptations: the diff from the locked commit's demo file after the content rules to the file on disk. The header of an existing adaptation is kept; a new one gets a header to fill in, and generation refuses it until it is.
 * @param {{ packageDir?: string, sourceDir?: string, files?: string[], fetchImpl?: typeof fetch, ref?: string }} options - `files` demo-relative, all when empty; `ref`, when given, must be the commit the lock names (a `--ref` generation moves the lock first, and the files on disk follow that commit only then)
 * @returns {Promise<string[]>} the adaptations written or removed
 */
// @cpt-flow:cpt-template-catalogue-flow-catalogue-generation-record:p2
// @cpt-dod:cpt-template-catalogue-dod-catalogue-generation-record:p2
export async function recordAdaptations({ packageDir = PACKAGE_DIR, sourceDir, files = [], fetchImpl, ref } = {}) {
  const lock = readLock(packageDir);
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-record:p2:inst-refuse-unmoved-ref
  if (ref !== undefined && ref !== lock.source.ref) throw new Error(`--record diffs against the locked commit, and the lock names ${lock.source.ref}, not ${ref}: run "npm run generate -- --ref ${ref}" first, which moves the lock and writes each file whose adaptation no longer applies as the new source, then redo the edit and record it`);
  // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-record:p2:inst-refuse-unmoved-ref
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-record:p2:inst-load-targets
  const targets = files.length > 0 ? files : Object.keys(lock.files);
  const sources = await loadSources(lock.source, targets, { packageDir, sourceDir, fetchImpl, expected: lock.files });
  const existing = readAdaptations(packageDir);
  // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-record:p2:inst-load-targets
  const changed = [];
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-record:p2:inst-each-target
  for (const file of targets) {
    // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-record:p2:inst-refuse-unknown-file
    if (!(file in lock.files)) throw new Error(`${file} is not a kit demo file of the lock`);
    // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-record:p2:inst-refuse-unknown-file
    // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-record:p2:inst-diff-target
    const onDisk = fs.readFileSync(path.join(packageDir, OUTPUT_ROOT, file), 'utf8');
    const patchPath = path.join(packageDir, ADAPTATIONS_DIR, `${file}.patch`);
    const diff = createPatch(applyContentRules(sources.get(file)), onDisk, file);
    const previous = existing.get(file);
    // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-record:p2:inst-diff-target
    // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-record:p2:inst-drop-adaptation
    if (diff === undefined) {
      if (previous !== undefined) {
        fs.rmSync(patchPath);
        changed.push(`removed ${ADAPTATIONS_DIR}/${file}.patch`);
      }
      continue;
    }
    // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-record:p2:inst-drop-adaptation
    // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-record:p2:inst-write-adaptation
    const header = previous?.split('\n--- ')[0] ?? `Adaptation of ${file}\nKind: TODO mechanical or substantive\nReason: TODO why the site differs from the kit demo here\n`;
    const next = `${header.endsWith('\n') ? header : `${header}\n`}${diff}`;
    if (next !== previous) {
      fs.mkdirSync(path.dirname(patchPath), { recursive: true });
      fs.writeFileSync(patchPath, next);
      changed.push(`wrote ${ADAPTATIONS_DIR}/${file}.patch`);
    }
    // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-record:p2:inst-write-adaptation
  }
  // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-record:p2:inst-each-target
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-record:p2:inst-return-changed
  return changed;
  // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-record:p2:inst-return-changed
}

/** @param {string[]} argv */
// @cpt-dod:cpt-template-catalogue-dod-catalogue-generation-commands:p2
export function parseArgs(argv) {
  const args = { check: false, record: undefined, ref: undefined, sourceDir: undefined };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--check') args.check = true;
    else if (arg === '--ref') args.ref = argv[++index];
    else if (arg === '--source') args.sourceDir = path.resolve(argv[++index]);
    else if (arg === '--record') {
      args.record = [];
      while (argv[index + 1] && !argv[index + 1].startsWith('--')) args.record.push(argv[++index].replace(/^src\//, ''));
    } else throw new Error(`unknown argument ${arg}`);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.check) {
    // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-check:p1:inst-run-check
    const problems = await checkCatalogue({ sourceDir: args.sourceDir });
    // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-check:p1:inst-run-check
    // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-check:p1:inst-report-problems
    if (problems.length > 0) {
      console.error(`The catalogue differs from its generation:\n${problems.map((problem) => `  ${problem}`).join('\n')}\nA generated file changes only through the generator: run "npm run generate" to regenerate, or "npm run generate -- --record <file>" to keep a deliberate edit as an adaptation (the catalogue-generation guideline).`);
      process.exitCode = 1;
      return;
    }
    // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-check:p1:inst-report-problems
    // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-check:p1:inst-report-match
    console.log(`The catalogue matches ${KIT_PACKAGE} ${readLock(PACKAGE_DIR).kit.version} and its adaptations.`);
    // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-check:p1:inst-report-match
    return;
  }
  if (args.record) {
    // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-record:p2:inst-run-record
    const changed = await recordAdaptations({ sourceDir: args.sourceDir, files: args.record, ref: args.ref });
    console.log(changed.length > 0 ? changed.join('\n') : 'No adaptation changed.');
    // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-record:p2:inst-run-record
    return;
  }
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-run-generate
  const { files, unported } = await generateCatalogue({ sourceDir: args.sourceDir, ref: args.ref });
  // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-run-generate
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-report-count
  console.log(`Generated ${files.size} files from ${KIT_PACKAGE} ${readLock(PACKAGE_DIR).kit.version}.`);
  // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-report-count
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-report-unported
  if (unported.length > 0) {
    console.error(`These adaptations no longer apply; each file now holds the new kit source, and its adaptation is unchanged:\n${unported.map((problem) => `  ${problem}`).join('\n')}\nRedo each edit on the new source (the adaptation shows it), then run "npm run generate -- --record <file>" and "npm run generate:check".`);
    process.exitCode = 1;
  }
  // @cpt-end:cpt-template-catalogue-flow-catalogue-generation-generate:p1:inst-report-unported
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
