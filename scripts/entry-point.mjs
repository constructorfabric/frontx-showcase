// Whether a repository script runs as the command (`node scripts/<name>.mjs`) or is imported by a test. Node resolves symlinks for the main module, so `import.meta.url` holds the real path while `process.argv[1]` holds the path as typed; both sides are compared as real paths, so a script started through a symlinked checkout or directory still runs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// @cpt-algo:cpt-site-algo-template-composition-entry-point:p1
// @cpt-dod:cpt-site-dod-template-composition-shared-modules:p1
/**
 * @param {string} moduleUrl - the calling module's `import.meta.url`
 * @param {string | undefined} [argvPath] - the started script, `process.argv[1]` by default
 * @returns {boolean}
 */
export function isEntryPoint(moduleUrl, argvPath = process.argv[1]) {
  // @cpt-begin:cpt-site-algo-template-composition-entry-point:p1:inst-no-script
  if (!argvPath) return false;
  // @cpt-end:cpt-site-algo-template-composition-entry-point:p1:inst-no-script
  // @cpt-begin:cpt-site-algo-template-composition-entry-point:p1:inst-compare-real
  const real = (file) => {
    try {
      return fs.realpathSync(file);
    } catch {
      return path.resolve(file);
    }
  };
  return real(fileURLToPath(moduleUrl)) === real(path.resolve(argvPath));
  // @cpt-end:cpt-site-algo-template-composition-entry-point:p1:inst-compare-real
}
