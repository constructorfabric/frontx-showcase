/**
 * Build freshness checks for the incremental dev run (`dev:fast`): a build
 * output is stale when it is missing or older than the newest of its inputs.
 * Inputs are compared by modification time; `site:assemble` rewrites only the
 * files whose content changed, so an unchanged template keeps its times.
 */

import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import type { MfeInfo } from './mfe-tools.js';

/** Directories that hold outputs or installs, never build inputs. */
const SKIPPED_DIRS = new Set(['node_modules', 'dist', 'dist-lib', '@mf-types', 'coverage']);

/** Newest modification time (ms) of a file, or of any file below a directory; 0 when absent. */
export function newestMtime(path: string): number {
  if (!existsSync(path)) return 0;
  const stat = statSync(path);
  if (!stat.isDirectory()) return stat.mtimeMs;
  let newest = 0;
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || (entry.isDirectory() && SKIPPED_DIRS.has(entry.name))) continue;
    newest = Math.max(newest, newestMtime(join(path, entry.name)));
  }
  return newest;
}

/** Whether the output file is missing or older than any of the inputs. */
export function isStale(output: string, inputs: string[]): boolean {
  if (!existsSync(output)) return true;
  const built = statSync(output).mtimeMs;
  return inputs.some((input) => newestMtime(input) > built);
}

/** Library sources and their build outputs: the root lib and every solution package. */
function libraryTargets(siteDir: string): { output: string; inputs: string[] }[] {
  const lockfile = join(siteDir, 'package-lock.json');
  const targets = [
    {
      output: join(siteDir, 'dist-lib', 'index.js'),
      inputs: [join(siteDir, 'src'), join(siteDir, 'tsup.config.ts'), lockfile],
    },
  ];
  const packagesDir = join(siteDir, 'packages');
  for (const name of existsSync(packagesDir) ? readdirSync(packagesDir) : []) {
    const dir = join(packagesDir, name);
    if (!existsSync(join(dir, 'package.json'))) continue;
    targets.push({ output: join(dir, 'dist', 'index.js'), inputs: [dir, lockfile] });
  }
  return targets;
}

/** Whether the root lib or any solution package needs `npm run build:packages`. */
export function packagesStale(siteDir: string): boolean {
  return libraryTargets(siteDir).some(({ output, inputs }) => isStale(output, inputs));
}

/**
 * The MFE packages whose `dist/mf-manifest.json` is missing or older than the
 * package's own files or anything every package builds against: the shared
 * screen code, the verify packages, the solution package outputs and the
 * site lockfile.
 */
export function staleMfes(siteDir: string, mfes: MfeInfo[]): MfeInfo[] {
  const shared = [
    join(siteDir, 'src-app', 'mfe_packages', 'shared'),
    join(siteDir, 'src-app', 'verify_packages'),
    join(siteDir, 'package-lock.json'),
    ...libraryTargets(siteDir).map(({ output }) => output),
  ];
  return mfes.filter((mfe) => {
    const dir = join(siteDir, 'src-app', 'mfe_packages', mfe.name);
    return isStale(join(dir, 'dist', 'mf-manifest.json'), [dir, ...shared]);
  });
}
