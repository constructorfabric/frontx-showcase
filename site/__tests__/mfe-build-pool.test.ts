/**
 * Tests for the pool that runs MFE builds in parallel.
 *
 * The builds are real child processes: each fixture package carries a stub
 * `vite` whose CLI prints one line to stdout and one to stderr, leaves a start
 * marker, waits for a `release` file when its package asks it to, and exits
 * with the status its package asks for. The test creates `release` itself, so
 * the order of events is set by handshakes, not by timing. What is pinned is
 * the contract `buildMfes` documents: up to `concurrency` builds at once, a
 * start notice per build, no new build after the first failure, the running
 * ones finish, each package's output prints as one block under its header, and
 * the rejection is the failed package's `buildFailureMessage`.
 */

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { format } from 'util';

import { afterAll, afterEach, beforeAll, describe, it, expect, vi } from 'vitest';

type MfeTools = typeof import('../scripts/lib/mfe-tools');

// The stub appends to the order log at the fixture root, three levels above
// its package (`src-app/mfe_packages/<name>`).
const STUB_CLI = `
const fs = require('fs');
const path = require('path');
const dir = process.cwd();
const name = path.basename(dir);
const log = path.join(dir, '..', '..', '..', 'order.log');
process.stdout.write('stub stdout ' + name + '\\n');
process.stderr.write('stub stderr ' + name + '\\n');
fs.appendFileSync(log, 'start ' + name + '\\n');
fs.writeFileSync(path.join(dir, 'started'), '');
const finish = () => {
  fs.writeFileSync(path.join(dir, 'finished'), '');
  fs.appendFileSync(log, 'end ' + name + '\\n');
  process.exitCode = fs.existsSync(path.join(dir, 'fail')) ? 1 : 0;
};
if (!fs.existsSync(path.join(dir, 'wait'))) finish();
else {
  // A hard limit, so a stub the test never releases cannot outlive it.
  const deadline = Date.now() + 10000;
  const poll = setInterval(() => {
    if (Date.now() > deadline) process.exit(2);
    if (!fs.existsSync(path.join(dir, 'release'))) return;
    clearInterval(poll);
    finish();
  }, 10);
}
`;

let root: string;
let fixtures = 0;
// Every package folder a fixture made, so afterEach can release a stub a failed test left waiting.
const packageDirs: string[] = [];

interface Fixture {
  readonly tools: MfeTools;
  readonly dir: (name: string) => string;
  readonly mfes: Array<{ name: string; port: number }>;
  readonly order: () => string[];
}

/**
 * A fresh project folder with one stub package per entry and an empty order
 * log, and the pool module loaded from inside it: MFE_PACKAGES_DIR is resolved
 * from the working directory when the module loads. `process.chdir` works only
 * in a child process, which is what Vitest's default pool, forks, runs each
 * file in; worker threads would refuse it.
 */
async function fixture(packages: ReadonlyArray<{ name: string; wait?: boolean; fail?: boolean; vite?: boolean }>): Promise<Fixture> {
  const project = join(root, String(++fixtures));
  mkdirSync(join(project, 'src-app', 'mfe_packages'), { recursive: true });
  writeFileSync(join(project, 'order.log'), '');
  const cwd = process.cwd();
  process.chdir(project);
  let tools: MfeTools;
  try {
    vi.resetModules();
    tools = await import('../scripts/lib/mfe-tools');
  } finally {
    process.chdir(cwd);
  }
  const dir = (name: string): string => join(tools.MFE_PACKAGES_DIR, name);
  for (const { name, wait, fail, vite: hasVite = true } of packages) {
    const vite = join(dir(name), 'node_modules', 'vite');
    mkdirSync(hasVite ? vite : dir(name), { recursive: true });
    packageDirs.push(dir(name));
    writeFileSync(join(dir(name), 'package.json'), JSON.stringify({ name, private: true }));
    if (wait) writeFileSync(join(dir(name), 'wait'), '');
    if (fail) writeFileSync(join(dir(name), 'fail'), '');
    // A package without the stub has no `vite` to resolve: its build cannot start.
    if (!hasVite) continue;
    writeFileSync(join(vite, 'package.json'), JSON.stringify({ name: 'vite', bin: { vite: 'cli.js' } }));
    writeFileSync(join(vite, 'cli.js'), STUB_CLI);
  }
  return {
    tools,
    dir,
    mfes: packages.map(({ name }, i) => ({ name, port: 3001 + i })),
    order: () => readFileSync(join(project, 'order.log'), 'utf-8').trim().split('\n'),
  };
}

const exists = (file: string): void => {
  expect(existsSync(file), file).toBe(true);
};

/**
 * Starts `run` and records everything written to stdout, stderr and
 * console.log while it is pending, in order; `settled` gives its error, if any.
 */
function capture(run: () => Promise<void>): {
  writes: string[];
  streams: Array<readonly ['stdout' | 'stderr', string]>;
  settled: Promise<unknown>;
} {
  const writes: string[] = [];
  const streams: Array<readonly ['stdout' | 'stderr', string]> = [];
  const recorder =
    (stream: 'stdout' | 'stderr') =>
    (chunk: unknown): boolean => {
      if (chunk !== '') {
        writes.push(String(chunk));
        streams.push([stream, String(chunk)]);
      }
      return true;
    };
  const out = vi.spyOn(process.stdout, 'write').mockImplementation(recorder('stdout'));
  const err = vi.spyOn(process.stderr, 'write').mockImplementation(recorder('stderr'));
  const log = vi.spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
    writes.push(`${format(...args)}\n`);
    streams.push(['stdout', `${format(...args)}\n`]);
  });
  const settled = run().then(
    () => undefined,
    (error: unknown) => error,
  );
  void settled.finally(() => {
    out.mockRestore();
    err.mockRestore();
    log.mockRestore();
  });
  return { writes, streams, settled };
}

/** The index of the first write that starts, after its leading newlines, with `prefix`. */
function lineIndex(writes: readonly string[], prefix: string): number {
  return writes.findIndex((write) => write.replace(/^\n+/, '').startsWith(prefix));
}

/**
 * Asserts that a package's header and its two stub lines form one block: the
 * header comes first, and every write from it to the later stub line is that
 * package's, so no other package's line sits between its two (in either
 * order: stdout and stderr are separate pipes).
 */
function expectBlock(writes: readonly string[], name: string, status: 'built' | 'failed'): void {
  const header = lineIndex(writes, `📦 ${name} ${status} in `);
  const lines = [writes.indexOf(`stub stdout ${name}\n`), writes.indexOf(`stub stderr ${name}\n`)];
  expect(header, name).toBeGreaterThanOrEqual(0);
  expect(Math.min(...lines), name).toBeGreaterThan(header);
  expect(writes.slice(header, Math.max(...lines) + 1).every((write) => write.includes(name)), name).toBe(true);
}

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'mfe-build-pool-'));
});

afterEach(() => {
  for (const dir of packageDirs.splice(0)) writeFileSync(join(dir, 'release'), '');
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('buildMfes', () => {
  it('starts no build after a failure, lets the running one finish and prints each output as one block', async () => {
    const { tools, dir, mfes } = await fixture([
      { name: 'pkg-1', wait: true },
      { name: 'pkg-2', fail: true },
      { name: 'pkg-3' },
      { name: 'pkg-4' },
    ]);

    const { writes, settled } = capture(() => tools.buildMfes(mfes, 2));
    // pkg-1 holds its worker until the failure is printed, so no worker is free to take pkg-3 before it.
    await vi.waitFor(() => expect(lineIndex(writes, '📦 pkg-2 failed in ')).toBeGreaterThanOrEqual(0), { timeout: 10_000 });
    writeFileSync(join(dir('pkg-1'), 'release'), '');
    const error = await settled;

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe(
      tools.buildFailureMessage('pkg-2', dir('pkg-2'), { kind: 'exit', code: 1, signal: null }),
    );
    expect(existsSync(join(dir('pkg-3'), 'started'))).toBe(false);
    expect(existsSync(join(dir('pkg-4'), 'started'))).toBe(false);
    exists(join(dir('pkg-1'), 'finished'));

    expect(lineIndex(writes, '📦 started pkg-1')).toBeGreaterThanOrEqual(0);
    expect(lineIndex(writes, '📦 started pkg-2')).toBeGreaterThanOrEqual(0);
    expect(lineIndex(writes, '📦 started pkg-3')).toBe(-1);
    expectBlock(writes, 'pkg-2', 'failed');
    // The sibling's block comes after, whole, once it finishes.
    expectBlock(writes, 'pkg-1', 'built');
    expect(lineIndex(writes, '📦 pkg-1 built in ')).toBeGreaterThan(lineIndex(writes, '📦 pkg-2 failed in '));
  });

  it('runs up to the concurrency at once and starts the next build when one ends', async () => {
    const { tools, dir, mfes, order } = await fixture([
      { name: 'pkg-a', wait: true },
      { name: 'pkg-b', wait: true },
      { name: 'pkg-c', wait: true },
    ]);

    const { writes, streams, settled } = capture(() => tools.buildMfes(mfes, 2));
    // a and b both start while neither can end, and c has no worker left.
    await vi.waitFor(() => {
      exists(join(dir('pkg-a'), 'started'));
      exists(join(dir('pkg-b'), 'started'));
    }, { timeout: 10_000 });
    expect(existsSync(join(dir('pkg-c'), 'started'))).toBe(false);

    writeFileSync(join(dir('pkg-a'), 'release'), '');
    await vi.waitFor(() => exists(join(dir('pkg-c'), 'started')), { timeout: 10_000 });
    expect(existsSync(join(dir('pkg-b'), 'finished'))).toBe(false);
    writeFileSync(join(dir('pkg-b'), 'release'), '');
    writeFileSync(join(dir('pkg-c'), 'release'), '');

    expect(await settled).toBeUndefined();
    const events = order();
    expect(events.slice(0, 2).sort()).toEqual(['start pkg-a', 'start pkg-b']);
    expect(events.indexOf('end pkg-a')).toBeLessThan(events.indexOf('start pkg-c'));
    for (const name of ['pkg-a', 'pkg-b', 'pkg-c']) {
      expect(lineIndex(writes, `📦 started ${name}`), name).toBeGreaterThanOrEqual(0);
      expectBlock(writes, name, 'built');
      // The child's stdout line goes to our stdout and its stderr line to our stderr.
      expect(streams, name).toContainEqual(['stdout', `stub stdout ${name}\n`]);
      expect(streams, name).toContainEqual(['stderr', `stub stderr ${name}\n`]);
    }
  });

  it('builds the packages one after another, in order, with a concurrency of 1', async () => {
    const { tools, dir, mfes, order } = await fixture([{ name: 'pkg-a', wait: true }, { name: 'pkg-b' }, { name: 'pkg-c' }]);

    const { settled } = capture(() => tools.buildMfes(mfes, 1));
    // pkg-a is running and holds the only worker: pkg-b must not start until it ends.
    await vi.waitFor(() => exists(join(dir('pkg-a'), 'started')), { timeout: 10_000 });
    expect(existsSync(join(dir('pkg-b'), 'started'))).toBe(false);
    writeFileSync(join(dir('pkg-a'), 'release'), '');

    expect(await settled).toBeUndefined();
    expect(order()).toEqual(['start pkg-a', 'end pkg-a', 'start pkg-b', 'end pkg-b', 'start pkg-c', 'end pkg-c']);
  });

  it('rejects with the spawn failure of a package whose build cannot start', async () => {
    const { tools, dir, mfes } = await fixture([{ name: 'pkg-a', vite: false }]);

    const error = await capture(() => tools.buildMfes(mfes, 1)).settled;

    expect(error).toBeInstanceOf(Error);
    const message = (error as Error).message;
    expect(message).toContain('MFE build for pkg-a could not start:');
    expect(message).toContain(`npm install --prefix ${dir('pkg-a')}`);
  });

  it('rejects with the first recorded failure when two builds fail', async () => {
    const { tools, dir, mfes } = await fixture([
      { name: 'pkg-1', wait: true, fail: true },
      { name: 'pkg-2', wait: true, fail: true },
    ]);

    const { writes, settled } = capture(() => tools.buildMfes(mfes, 2));
    await vi.waitFor(() => {
      exists(join(dir('pkg-1'), 'started'));
      exists(join(dir('pkg-2'), 'started'));
    }, { timeout: 10_000 });
    writeFileSync(join(dir('pkg-1'), 'release'), '');
    await vi.waitFor(() => expect(lineIndex(writes, '📦 pkg-1 failed in ')).toBeGreaterThanOrEqual(0), { timeout: 10_000 });
    writeFileSync(join(dir('pkg-2'), 'release'), '');

    const error = await settled;
    expect(lineIndex(writes, '📦 pkg-2 failed in ')).toBeGreaterThan(lineIndex(writes, '📦 pkg-1 failed in '));
    expect((error as Error).message).toBe(
      tools.buildFailureMessage('pkg-1', dir('pkg-1'), { kind: 'exit', code: 1, signal: null }),
    );
  });

  it('reads the concurrency from the environment and never states more workers than packages', async () => {
    const { tools, mfes } = await fixture([{ name: 'pkg-a' }]);
    vi.stubEnv(tools.BUILD_CONCURRENCY_ENV_VAR, '2');
    try {
      const { writes, settled } = capture(() => tools.buildMfes(mfes));
      expect(await settled).toBeUndefined();
      expect(writes[0]).toContain('1 at a time');
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('refuses a concurrency that is not a positive integer, and reads none when there is nothing to build', async () => {
    const { tools, mfes } = await fixture([{ name: 'pkg-a' }]);
    for (const concurrency of [0, -1, 1.5, Number.NaN]) {
      await expect(tools.buildMfes(mfes, concurrency), String(concurrency)).rejects.toThrow('concurrency must be a positive integer');
    }
    vi.stubEnv(tools.BUILD_CONCURRENCY_ENV_VAR, 'abc');
    try {
      await expect(tools.buildMfes([])).resolves.toBeUndefined();
      await expect(tools.buildMfes(mfes)).rejects.toThrow(tools.BUILD_CONCURRENCY_ENV_VAR);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
