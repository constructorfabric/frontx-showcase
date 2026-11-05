/**
 * Tests for the pool that runs MFE builds in parallel.
 *
 * The builds are real child processes: each fixture package carries a stub
 * `vite` whose CLI leaves a start marker, prints one line to stdout and one to
 * stderr, waits, and exits with the status its package asks for. What is pinned
 * is the contract `buildMfes` documents: no new build after the first failure,
 * the running ones finish, each package's output prints as one block, and the
 * rejection is that package's `buildFailureMessage`.
 */

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { afterAll, beforeAll, describe, it, expect, vi } from 'vitest';

type MfeTools = typeof import('../scripts/lib/mfe-tools');

// The stub appends to the order log at the fixture root, three levels above
// its package (`src-app/mfe_packages/<name>`).
const STUB_CLI = `
const fs = require('fs');
const path = require('path');
const dir = process.cwd();
const name = path.basename(dir);
const log = path.join(dir, '..', '..', '..', 'order.log');
const delay = Number(fs.readFileSync(path.join(dir, 'delay'), 'utf-8'));
fs.writeFileSync(path.join(dir, 'started'), '');
fs.appendFileSync(log, 'start ' + name + '\\n');
process.stdout.write('stub stdout ' + name + '\\n');
process.stderr.write('stub stderr ' + name + '\\n');
setTimeout(() => {
  fs.writeFileSync(path.join(dir, 'finished'), '');
  fs.appendFileSync(log, 'end ' + name + '\\n');
  process.exitCode = fs.existsSync(path.join(dir, 'fail')) ? 1 : 0;
}, delay);
`;

let root: string;
let tools: MfeTools;

function packageDir(name: string): string {
  return join(tools.MFE_PACKAGES_DIR, name);
}

/** One stub package per entry, and an empty order log. */
function fixture(packages: ReadonlyArray<{ name: string; delay: number; fail?: boolean }>): void {
  writeFileSync(join(root, 'order.log'), '');
  for (const { name, delay, fail } of packages) {
    const dir = packageDir(name);
    const vite = join(dir, 'node_modules', 'vite');
    mkdirSync(vite, { recursive: true });
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name, private: true }));
    writeFileSync(join(dir, 'delay'), String(delay));
    if (fail) writeFileSync(join(dir, 'fail'), '');
    writeFileSync(join(vite, 'package.json'), JSON.stringify({ name: 'vite', bin: { vite: 'cli.js' } }));
    writeFileSync(join(vite, 'cli.js'), STUB_CLI);
  }
}

function order(): string[] {
  return readFileSync(join(root, 'order.log'), 'utf-8').trim().split('\n');
}

/** Everything written to stdout and stderr while `run` is pending, in order. */
async function capture(run: () => Promise<void>): Promise<{ writes: string[]; error: unknown }> {
  const writes: string[] = [];
  const record = (chunk: unknown): boolean => {
    writes.push(String(chunk));
    return true;
  };
  const out = vi.spyOn(process.stdout, 'write').mockImplementation(record);
  const err = vi.spyOn(process.stderr, 'write').mockImplementation(record);
  const log = vi.spyOn(console, 'log').mockImplementation(() => {});
  try {
    await run();
    return { writes, error: undefined };
  } catch (error) {
    return { writes, error };
  } finally {
    out.mockRestore();
    err.mockRestore();
    log.mockRestore();
  }
}

beforeAll(async () => {
  // MFE_PACKAGES_DIR is resolved from the working directory when the module
  // loads, so load it from inside the fixture root.
  root = mkdtempSync(join(tmpdir(), 'mfe-build-pool-'));
  mkdirSync(join(root, 'src-app', 'mfe_packages'), { recursive: true });
  const cwd = process.cwd();
  process.chdir(root);
  try {
    vi.resetModules();
    tools = await import('../scripts/lib/mfe-tools');
  } finally {
    process.chdir(cwd);
  }
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('buildMfes', () => {
  it('starts no build after a failure, lets the running one finish and prints the failed output as one block', async () => {
    fixture([
      { name: 'pkg-1', delay: 600 },
      { name: 'pkg-2', delay: 50, fail: true },
      { name: 'pkg-3', delay: 50 },
      { name: 'pkg-4', delay: 50 },
    ]);
    const mfes = ['pkg-1', 'pkg-2', 'pkg-3', 'pkg-4'].map((name, i) => ({ name, port: 3001 + i }));

    const { writes, error } = await capture(() => tools.buildMfes(mfes, 2));

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe(
      tools.buildFailureMessage('pkg-2', packageDir('pkg-2'), { kind: 'exit', code: 1, signal: null }),
    );
    expect(existsSync(join(packageDir('pkg-3'), 'started'))).toBe(false);
    expect(existsSync(join(packageDir('pkg-4'), 'started'))).toBe(false);
    expect(existsSync(join(packageDir('pkg-1'), 'finished'))).toBe(true);

    const failedOut = writes.indexOf('stub stdout pkg-2\n');
    expect(failedOut).toBeGreaterThanOrEqual(0);
    expect(writes[failedOut + 1]).toBe('stub stderr pkg-2\n');
    // The sibling's block comes after, whole, once it finishes.
    const siblingOut = writes.indexOf('stub stdout pkg-1\n');
    expect(siblingOut).toBeGreaterThan(failedOut);
    expect(writes[siblingOut + 1]).toBe('stub stderr pkg-1\n');
  });

  it('builds the packages one after another, in order, with a concurrency of 1', async () => {
    fixture([
      { name: 'pkg-a', delay: 30 },
      { name: 'pkg-b', delay: 30 },
      { name: 'pkg-c', delay: 30 },
    ]);
    const mfes = ['pkg-a', 'pkg-b', 'pkg-c'].map((name, i) => ({ name, port: 3001 + i }));

    const { error } = await capture(() => tools.buildMfes(mfes, 1));

    expect(error).toBeUndefined();
    expect(order()).toEqual(['start pkg-a', 'end pkg-a', 'start pkg-b', 'end pkg-b', 'start pkg-c', 'end pkg-c']);
  });
});
