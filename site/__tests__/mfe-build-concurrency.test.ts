/**
 * Tests for how many MFE builds run at once.
 *
 * Each build is a full Vite run, so the number is a memory budget as much as a
 * speed setting: the default has to stay within its bounds on any machine, and a
 * value the operator mistyped has to stop the build with the variable's name
 * rather than fall back to a number nobody chose.
 */

import { availableParallelism } from 'os';

import { describe, it, expect, vi } from 'vitest';

import { BUILD_CONCURRENCY_ENV_VAR, buildConcurrency } from '../scripts/lib/mfe-tools';

vi.mock('os', async (importOriginal) => {
  const actual = await importOriginal<typeof import('os')>();
  return { ...actual, availableParallelism: vi.fn(actual.availableParallelism) };
});

describe('buildConcurrency', () => {
  it.each([
    [1, 1],
    [3, 1],
    [8, 4],
    [64, 6],
  ])('defaults to %i cores -> %i builds when unset or empty', (cores, builds) => {
    vi.mocked(availableParallelism).mockReturnValue(cores);

    expect(buildConcurrency({})).toBe(builds);
    expect(buildConcurrency({ [BUILD_CONCURRENCY_ENV_VAR]: '' })).toBe(builds);
  });

  it('takes a positive integer as given, above the default too', () => {
    expect(buildConcurrency({ [BUILD_CONCURRENCY_ENV_VAR]: '1' })).toBe(1);
    expect(buildConcurrency({ [BUILD_CONCURRENCY_ENV_VAR]: '8' })).toBe(8);
  });

  it.each(['0', '-1', '2.5', 'abc', ' 4 ', '0x10', '1e1'])('refuses %j, naming the variable', (value) => {
    expect(() => buildConcurrency({ [BUILD_CONCURRENCY_ENV_VAR]: value })).toThrow(
      BUILD_CONCURRENCY_ENV_VAR,
    );
  });
});
