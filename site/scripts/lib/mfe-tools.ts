#!/usr/bin/env node

/**
 * Shared MFE package discovery and build utilities.
 * Used by dev-all.ts (build + preview) and build-mfes.ts (build only).
 */

import { spawn } from 'child_process';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { createRequire } from 'module';
import { availableParallelism } from 'os';
import { dirname, join } from 'path';

export const MFE_PACKAGES_DIR = join(process.cwd(), 'src-app/mfe_packages');

// Packages to skip (shared libraries, hidden dirs)
const EXCLUDED_PACKAGES = new Set(['shared']);

/**
 * Whether a directory under `src-app/mfe_packages/` is not an MFE package at
 * all: the `shared` library packages import from, or a dot-directory some tool
 * left there.
 *
 * Distinct from the template-example rule, and not reported like it: this
 * answers "never was a package", where the flag answers "a package this run is
 * choosing to leave out", which is why one is announced and this one is not.
 * Shared so every scanner draws the boundary in the same place.
 */
export function isNonPackageDirectory(name: string): boolean {
  return EXCLUDED_PACKAGES.has(name) || name.startsWith('.');
}

/**
 * Environment variable that puts the template's own example packages back into
 * discovery. Off by default so an applied project runs only the packages its
 * developer added; set for a run that means to watch the shipped examples work
 * rather than read them.
 */
export const TEMPLATE_EXAMPLES_ENV_VAR = 'FRONTX_INCLUDE_TEMPLATE_EXAMPLES';

export interface MfeInfo {
  name: string;
  port: number;
}

/**
 * Whether the parsed body of an `mfe.json` declares its package as one the
 * template ships as an example or as the scaffold other packages are copied
 * from, rather than as part of the product built on top of the template.
 */
function declaresTemplateExample(mfeJson: unknown): boolean {
  return (
    typeof mfeJson === 'object' &&
    mfeJson !== null &&
    'templateExample' in mfeJson &&
    mfeJson.templateExample === true
  );
}

/**
 * The script text a package's dev-server port is declared in: its `preview`
 * script when it has one, otherwise `dev`, otherwise the empty string.
 *
 * `preview` comes first because it is the script `dev:all` actually spawns per
 * package, so its `--port` is the one the shell will reach; `dev` is the
 * fallback for a package that declares no `preview`.
 *
 * The body arrives as `unknown` straight from `JSON.parse`, so every hop down to
 * the script text is checked rather than asserted - the same narrowing
 * `declaresTemplateExample` applies to an `mfe.json` body.
 */
function portSourceScript(packageJson: unknown): string {
  if (typeof packageJson !== 'object' || packageJson === null) return '';
  if (!('scripts' in packageJson)) return '';

  const scripts = packageJson.scripts;
  if (typeof scripts !== 'object' || scripts === null) return '';

  if ('preview' in scripts && typeof scripts.preview === 'string') return scripts.preview;
  if ('dev' in scripts && typeof scripts.dev === 'string') return scripts.dev;

  return '';
}

/**
 * Whether the MFE package at `packagePath` declares itself template example
 * content via `"templateExample": true` in its `mfe.json`.
 *
 * A package that carries the flag is shipped for reading and copying, not for
 * running: an applied project inherits it along with the rest of the template's
 * territory, and leaving it in discovery is what puts screens nobody asked for
 * into the product's navigation menu (constructorfabric/gears-frontx#550).
 *
 * @param packagePath - Absolute path of the package directory, not of its `mfe.json`
 */
export function isTemplateExamplePackage(packagePath: string): boolean {
  const mfeJsonPath = join(packagePath, 'mfe.json');
  if (!existsSync(mfeJsonPath)) return false;

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(mfeJsonPath, 'utf-8'));
  } catch {
    // An `mfe.json` that does not parse is the build's failure to report: the
    // `frontxMfGts` plugin parses this same file, and its throw surfaces through
    // `buildMfes` as "MFE build failed for <name>". (Manifest
    // generation never sees it - that reads `dist/mfe-manifest.json`.) Answering
    // "not an example" leaves the package in discovery so it reaches that build,
    // rather than disappearing here under a flag it was never shown to carry.
    return false;
  }

  return declaresTemplateExample(parsed);
}

/**
 * Whether discovery includes packages that declare themselves template example
 * content. Exactly `1` opts in; anything else, set or unset, leaves the
 * product's own packages as the whole discovered set.
 *
 * One spelling on purpose. `FRONTX_CLI_FORCE_MAIN === '1'` is the ecosystem's
 * only precedent for an opt-in flag, and a second accepted spelling has to be
 * repeated on every surface that documents the flag - where the cost of one of
 * them drifting is a developer who believes examples are included and reads an
 * empty menu as a bug.
 *
 * @param env - Environment to read; defaults to the process environment
 */
export function templateExamplesIncluded(env: NodeJS.ProcessEnv = process.env): boolean {
  return env[TEMPLATE_EXAMPLES_ENV_VAR] === '1';
}

/**
 * Human-readable line naming the example packages discovery left out and the
 * variable that puts them back.
 *
 * Printed once per process, by each surface that decides to leave a package out:
 * manifest generation for the flows that build or serve, and
 * `run-mfe-type-checks.ts` for `type-check`, which generates no manifest (it
 * chains `:package`, `:package:test`, `:app`, `:packages` and `:mfe`) and so has
 * no other surface that could report it.
 *
 * Not once per npm script. `npm run build` runs `build:mfes` and then
 * `generate:mfe-manifests` as separate processes, so a project whose every
 * package is flagged sees the same four names twice - once as
 * `noDiscoveredPackagesNotice` from the build orchestrator, once from the
 * generator. Deduplicating across processes would mean passing state between
 * them, which is more machinery than a repeated informational line is worth. The
 * one repeat worth removing was inside a single process, where `dev:all` printed
 * from its own scan and again from the generator it spawns; that is why the
 * package scan returns the skipped names instead of printing them.
 */
export function templateExamplesSkippedNotice(skipped: readonly string[]): string {
  return (
    `ℹ️  Skipped ${skipped.length} template example package(s): ${skipped.join(', ')}. ` +
    `Set ${TEMPLATE_EXAMPLES_ENV_VAR}=1 to include them.`
  );
}

/**
 * The line an orchestrator prints when the scan found nothing to build or
 * serve. It names the example packages when they are the whole reason the set
 * is empty: "there are no packages here" and "every package here is an example"
 * call for different actions, and reporting both as the former after a skip
 * notice reads as a contradiction.
 */
export function noDiscoveredPackagesNotice(skippedExamples: readonly string[]): string {
  if (skippedExamples.length === 0) {
    return 'ℹ️  No MFE packages found in src-app/mfe_packages/.';
  }
  return (
    `ℹ️  No MFE packages found in src-app/mfe_packages/ beyond ${skippedExamples.length} ` +
    `template example package(s): ${skippedExamples.join(', ')}. ` +
    `Set ${TEMPLATE_EXAMPLES_ENV_VAR}=1 to include them.`
  );
}

/**
 * Outcome of one scan of an MFE packages directory. The skipped example names
 * travel with the packages because a caller reporting an empty set has to say
 * which kind of empty it is - see `noDiscoveredPackagesNotice`.
 */
export interface MfeDiscovery {
  /** Packages the shell builds, serves and aggregates, with the port each declares. */
  packages: MfeInfo[];
  /** Directory names left out because their `mfe.json` declares template example content. */
  skippedExamples: string[];
}

/**
 * Scan an MFE packages directory and extract each package's port from its
 * scripts.
 *
 * @param mfePackagesDir - Directory to scan. Defaults to this project's own
 *   `src-app/mfe_packages`; passed explicitly by tests, which cannot move the
 *   working directory the default was resolved from at import time
 */
export function getMFEPackages(mfePackagesDir: string = MFE_PACKAGES_DIR): MfeDiscovery {
  if (!existsSync(mfePackagesDir)) {
    return { packages: [], skippedExamples: [] };
  }

  const packages: MfeInfo[] = [];
  const skippedExamples: string[] = [];
  const entries = readdirSync(mfePackagesDir, { withFileTypes: true });
  const includeExamples = templateExamplesIncluded();

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (isNonPackageDirectory(entry.name)) continue;

    // Ahead of the port lookup: an example package is left out whether or not
    // its scripts carry a `--port`, and the "could not find --port" warning
    // below would be noise about a package nothing intends to start.
    if (!includeExamples && isTemplateExamplePackage(join(mfePackagesDir, entry.name))) {
      skippedExamples.push(entry.name);
      continue;
    }

    const pkgJsonPath = join(mfePackagesDir, entry.name, 'package.json');
    if (!existsSync(pkgJsonPath)) continue;

    try {
      const pkgJson: unknown = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
      const portMatch = portSourceScript(pkgJson).match(/--port\s+(\d+)/);

      if (!portMatch) {
        console.warn(`⚠️  Could not find --port in scripts for ${entry.name}, skipping`);
        continue;
      }

      packages.push({ name: entry.name, port: parseInt(portMatch[1], 10) });
    } catch (e) {
      console.warn(`⚠️  Failed to read package.json for ${entry.name}:`, e);
    }
  }

  return { packages, skippedExamples };
}

/**
 * How a package's `vite build` failed: the child ran and rejected the build, or
 * it never started at all.
 *
 * Both are the same event to the operator - this MFE did not build - so both go
 * through one report rather than one report and a raw spawn error.
 */
export type MfeBuildFailure =
  | {
      readonly kind: 'exit';
      readonly code: number | null;
      readonly signal: NodeJS.Signals | null;
    }
  | { readonly kind: 'spawn'; readonly cause: unknown };

/**
 * The message a failed `vite build` rejects with.
 *
 * `buildMfes` prints the failed package's buffered output before it rejects,
 * so this function is deliberately not in the business of reproducing that
 * output - everything Vite and the Module Federation plugin printed is already
 * on the terminal above this line, and re-printing it would only duplicate it.
 *
 * What is missing there is a next step. The federation plugin reports a failed
 * type generation as a bare `TYPE-001` code: it says the DTS build gave up but
 * not which declaration provoked it, because the plugin swallows the tsc
 * diagnostics behind its own code. That leaves the exit code as the only other
 * signal, and recovering the real one-line type error means knowing that each
 * MFE package carries its own `type-check` script, so the hint names that exact
 * command rather than describing it.
 *
 * A spawn failure gets the opposite treatment: nothing ran, so there is no
 * output above to interpret and no type error to chase. It carries the
 * underlying reason instead, because a bare `spawn ... ENOENT` does not say
 * which of the two commands could not be found or that an MFE build is what
 * failed.
 *
 * A signal kill is reported the same way, and for the same reason. Node reports
 * it as a null exit code with the signal alongside, so pairing it with the
 * TYPE-001 hint sent the reader looking for a type error in a build that was
 * stopped from outside - and "exit code null" named nothing at all. The two
 * likely causes are worth stating, since neither is a compile failure.
 */
export function buildFailureMessage(
  name: string,
  packageDir: string,
  failure: MfeBuildFailure,
): string {
  if (failure.kind === 'exit' && failure.signal !== null) {
    return [
      `MFE build for ${name} was terminated by signal ${failure.signal}.`,
      `The build was stopped from outside rather than failing to compile, so the output`,
      `above holds no diagnostics for it. On ${failure.signal} the usual causes are the`,
      `system running out of memory during the build and a manual interrupt.`,
    ].join('\n');
  }

  if (failure.kind === 'spawn') {
    const reason =
      failure.cause instanceof Error ? failure.cause.message : String(failure.cause);
    return [
      `MFE build for ${name} could not start: ${reason}`,
      `Nothing was built. This is the build command failing to launch rather than a`,
      `compile error, so check that dependencies are installed:`,
      `  npm install --prefix ${packageDir}`,
    ].join('\n');
  }

  return [
    `MFE build failed for ${name} with exit code ${failure.code}.`,
    `If the output above ends in a Module Federation TYPE-001 error, that code stands in for a`,
    `TypeScript error the plugin did not print. To see the actual diagnostics, run:`,
    `  npm run type-check --prefix ${packageDir}`,
  ].join('\n');
}

/**
 * Environment variable that sets how many `vite build` children run at once.
 * A positive integer; `1` builds the packages one after another.
 */
export const BUILD_CONCURRENCY_ENV_VAR = 'FRONTX_BUILD_CONCURRENCY';

/**
 * How many MFE builds run at once: the positive integer in
 * `FRONTX_BUILD_CONCURRENCY` when it is set, otherwise half the available
 * cores, at least 1 and at most 6. Each build is a full Vite and Rollup run, so
 * one per core starves them; past six the gain on a 14-package site is gone.
 *
 * @param env - Environment to read; defaults to the process environment
 */
export function buildConcurrency(env: NodeJS.ProcessEnv = process.env): number {
  const raw = env[BUILD_CONCURRENCY_ENV_VAR];
  if (raw === undefined || raw === '') {
    return Math.max(1, Math.min(6, Math.floor(availableParallelism() / 2)));
  }
  // Digits only: Number() alone would take ' 4 ', '0x10' and '1e1'.
  const value = /^\d+$/.test(raw) ? Number(raw) : NaN;
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${BUILD_CONCURRENCY_ENV_VAR} must be a positive integer, got "${raw}".`);
  }
  return value;
}

/** What a child wrote, in order, each chunk with the stream it came on. */
type MfeBuildOutput = ReadonlyArray<readonly [NodeJS.WriteStream, Buffer]>;

interface MfeBuildResult {
  readonly output: MfeBuildOutput;
  readonly seconds: number;
  readonly failure: MfeBuildFailure | null;
}

/**
 * The path of Vite's CLI script as `npx vite` run in `packageDir` would find
 * it: resolved from the package directory up through the site's install.
 */
function resolveViteCli(packageDir: string): string {
  const require = createRequire(join(packageDir, 'package.json'));
  const packageJsonPath = require.resolve('vite/package.json');
  const { bin } = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
    bin: string | Record<string, string>;
  };
  return join(dirname(packageJsonPath), typeof bin === 'string' ? bin : bin.vite);
}

/**
 * Run `vite build` in one package directory with its output captured.
 *
 * Vite's CLI script runs on this same Node binary: no PATH lookup (CWE-427, a
 * PATH entry shadowing a trusted executable), no `npx` start-up per package and
 * no `/bin/sh -c`, which is non-portable on Windows and fragile when a package
 * path contains shell-special characters.
 */
function buildMfe(packageDir: string): Promise<MfeBuildResult> {
  const started = performance.now();
  const output: Array<readonly [NodeJS.WriteStream, Buffer]> = [];
  const finish = (failure: MfeBuildFailure | null): MfeBuildResult => ({
    output,
    seconds: (performance.now() - started) / 1000,
    failure,
  });

  return new Promise((resolve) => {
    let viteCli: string;
    try {
      viteCli = resolveViteCli(packageDir);
    } catch (cause) {
      resolve(finish({ kind: 'spawn', cause }));
      return;
    }

    // Piped output is not a terminal, so keep Vite's colours when ours is one.
    const env =
      process.stdout.isTTY && process.env.FORCE_COLOR === undefined
        ? { ...process.env, FORCE_COLOR: '1' }
        : process.env;
    const proc = spawn(process.execPath, [viteCli, 'build'], {
      cwd: packageDir,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    // Two separate pipes: inside one package's block, a stdout line and a
    // stderr line can come out in another order than Vite wrote them.
    proc.stdout.on('data', (chunk: Buffer) => output.push([process.stdout, chunk]));
    proc.stderr.on('data', (chunk: Buffer) => output.push([process.stderr, chunk]));

    let settled = false;
    proc.on('error', (cause) => {
      if (settled) return;
      settled = true;
      resolve(finish({ kind: 'spawn', cause }));
    });
    // `close`, not `exit`: it waits for the pipes to drain, so the captured
    // output is complete when it is printed.
    proc.on('close', (code, signal) => {
      if (settled) return;
      settled = true;
      resolve(finish(code === 0 ? null : { kind: 'exit', code, signal }));
    });
  });
}

/** Print one package's captured output as a block headed by its name and time. */
function printBuildBlock(name: string, result: MfeBuildResult): void {
  const status = result.failure === null ? 'built' : 'failed';
  console.log(`\n📦 ${name} ${status} in ${result.seconds.toFixed(1)}s`);
  for (const [stream, chunk] of result.output) stream.write(chunk);
}

/**
 * Build MFE packages with `vite build` in each package directory, up to
 * `concurrency` at a time.
 *
 * Each child's output is buffered and printed as one block when it finishes,
 * so parallel builds never interleave. On the first failure no new build
 * starts; the running ones finish, and the promise rejects with that package's
 * `buildFailureMessage`.
 *
 * A one-line notice marks each start, so a build that hangs can be named.
 *
 * @param concurrency - Builds at once, a positive integer; defaults to
 *   `buildConcurrency()`, read only when there is something to build
 */
export async function buildMfes(mfes: MfeInfo[], concurrency?: number): Promise<void> {
  if (mfes.length === 0) return;

  const limit = concurrency ?? buildConcurrency();
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error(`buildMfes: concurrency must be a positive integer, got ${limit}.`);
  }
  const workers = Math.min(limit, mfes.length);
  console.log(`📦 Building ${mfes.length} MFE package(s), ${workers} at a time...`);

  let next = 0;
  // An array rather than a `let`: TypeScript does not see a closure assign one.
  const failures: Error[] = [];

  // No signal handler: Ctrl+C in a terminal and a CI cancel reach the whole process group, so the
  // vite children stop with this process (output still buffered at that moment is not printed).
  const worker = async (): Promise<void> => {
    while (failures.length === 0 && next < mfes.length) {
      const mfe = mfes[next++];
      const packageDir = join(MFE_PACKAGES_DIR, mfe.name);
      console.log(`📦 started ${mfe.name}`);
      const result = await buildMfe(packageDir);
      printBuildBlock(mfe.name, result);
      if (result.failure !== null) {
        failures.push(new Error(buildFailureMessage(mfe.name, packageDir, result.failure)));
      }
    }
  };

  await Promise.all(Array.from({ length: workers }, worker));
  if (failures.length > 0) throw failures[0];

  console.log('\n✅ All MFE packages built successfully.\n');
}
