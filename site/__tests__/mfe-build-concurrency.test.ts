/**
 * Tests for how many MFE builds run at once.
 *
 * Each build is a full Vite run, so the number is a memory budget as much as a
 * speed setting: the default has to stay within its bounds on any machine, and a
 * value the operator mistyped has to stop the build with the variable's name
 * rather than fall back to a number nobody chose.
 */

import { availableParallelism } from 'os';

import { describe, it, expect } from 'vitest';

import { BUILD_CONCURRENCY_ENV_VAR, buildConcurrency } from '../scripts/lib/mfe-tools';

describe('buildConcurrency', () => {
  it('defaults to half the cores, at least 1 and at most 6, when unset or empty', () => {
    const expected = Math.max(1, Math.min(6, Math.floor(availableParallelism() / 2)));

    expect(buildConcurrency({})).toBe(expected);
    expect(buildConcurrency({ [BUILD_CONCURRENCY_ENV_VAR]: '' })).toBe(expected);
  });

  it('takes a positive integer as given, above the default too', () => {
    expect(buildConcurrency({ [BUILD_CONCURRENCY_ENV_VAR]: '1' })).toBe(1);
    expect(buildConcurrency({ [BUILD_CONCURRENCY_ENV_VAR]: '8' })).toBe(8);
  });

  it.each(['0', '-1', '2.5', 'abc'])('refuses %s, naming the variable', (value) => {
    expect(() => buildConcurrency({ [BUILD_CONCURRENCY_ENV_VAR]: value })).toThrow(
      BUILD_CONCURRENCY_ENV_VAR,
    );
  });
});
