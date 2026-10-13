// Every screen package of this repository's templates that builds a FrontX app with both `mock()` and `queryCacheShared()` adds `mock()` first. `mock()` announces its initial state with a mock toggle on init, and a runtime's `queryCacheShared()` clears the page's whole shared QueryClient on every toggle it hears, so the other order wipes every read of the page when the package loads for the first time (architecture/DESIGN.md gap G51).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { findTemplateDirs } from './template-discovery.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MOCK = /\.use\(\s*(?:\w+\.)?mock\(/g;
const SHARED_CACHE = /\.use\(\s*(?:\w+\.)?queryCacheShared\(/g;

/** @param {string} dir @returns {string[]} */
function sources(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'node_modules' || entry.name === 'dist' ? [] : sources(full);
    return /\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

/**
 * The places in a source where `queryCacheShared()` is added before the `mock()` of the same app: each `mock()` use is held to the nearest shared-cache use before it.
 * @param {string} text
 */
export function sharedCacheBeforeMock(text) {
  const mocks = [...text.matchAll(MOCK)].map((match) => match.index);
  const caches = [...text.matchAll(SHARED_CACHE)].map((match) => match.index);
  return mocks.filter((at) => caches.some((cache) => cache < at && text.slice(cache, at).includes('.build(') === false));
}

describe('mock() before queryCacheShared()', () => {
  it('reads the order of one builder chain', () => {
    expect(sharedCacheBeforeMock('createFrontX().use(effects()).use(queryCacheShared()).use(mock()).build();')).toHaveLength(1);
    expect(sharedCacheBeforeMock('createFrontX().use(effects()).use(mock({ enabledByDefault: true })).use(queryCacheShared()).build();')).toEqual([]);
    expect(sharedCacheBeforeMock('runtime.createFrontX().use(runtime.queryCacheShared()).use(runtime.mock()).build();')).toHaveLength(1);
    expect(sharedCacheBeforeMock('a.use(queryCacheShared()).build(); b.use(mock()).build();')).toEqual([]);
  });

  it('holds in every screen package of the templates', () => {
    const files = findTemplateDirs(ROOT).flatMap((dir) => sources(path.join(dir, 'src-app/mfe_packages')));
    expect(files.length).toBeGreaterThan(0);
    const offenders = files.filter((file) => sharedCacheBeforeMock(fs.readFileSync(file, 'utf8')).length > 0).map((file) => path.relative(ROOT, file));
    expect(offenders).toEqual([]);
  });
});
