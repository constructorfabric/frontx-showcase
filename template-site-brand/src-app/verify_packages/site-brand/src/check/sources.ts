/**
 * The sources the brand check reads: style and script files under the project's roots.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Source } from './rules.ts';

const EXTENSIONS = new Set(['.css', '.ts', '.tsx', '.js', '.jsx', '.mjs']);
const SKIPPED_DIRS = new Set(['node_modules', 'dist', 'coverage', '.vite']);
const TEST = /\.(test|spec)\.[cm]?[jt]sx?$/;

// @cpt-algo:cpt-template-site-brand-algo-brand-check-collect-sources:p1
/** Every style and script file under `roots`, outside `excluded` directories, installs, build output and tests, sorted, with its path relative to `base`. */
export function collectSources(roots: readonly string[], excluded: readonly string[], base: string): Source[] {
  const out: Source[] = [];
  const skip = new Set(excluded.map((dir) => path.resolve(dir)));
  // @cpt-begin:cpt-template-site-brand-algo-brand-check-collect-sources:p1:inst-walk
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRS.has(entry.name) && !skip.has(path.resolve(full))) walk(full);
      } else if (EXTENSIONS.has(path.extname(entry.name)) && !TEST.test(entry.name)) {
        out.push({ path: path.relative(base, full).split(path.sep).join('/'), text: fs.readFileSync(full, 'utf8') });
      }
    }
  };
  for (const root of roots) {
    if (!fs.existsSync(root)) throw new Error(`source root ${root} is missing`);
    walk(root);
  }
  // @cpt-end:cpt-template-site-brand-algo-brand-check-collect-sources:p1:inst-walk
  // @cpt-begin:cpt-template-site-brand-algo-brand-check-collect-sources:p1:inst-sorted
  return out.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  // @cpt-end:cpt-template-site-brand-algo-brand-check-collect-sources:p1:inst-sorted
}
