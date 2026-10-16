import { describe, expect, it, vi } from 'vitest';
import { createSerialRunner } from './serialize.mjs';

/** A task that records each start and hands its `done` to the test. */
function recordingTask() {
  const pending = [];
  const run = vi.fn((done) => pending.push(done));
  return { run, finish: () => pending.shift()() };
}

describe('createSerialRunner', () => {
  it('coalesces every trigger during a run into one follow-up run', () => {
    const { run, finish } = recordingTask();
    const onCoalesce = vi.fn();
    const trigger = createSerialRunner(run, onCoalesce);
    trigger();
    trigger();
    trigger();
    trigger();
    expect(run).toHaveBeenCalledTimes(1);
    expect(onCoalesce).toHaveBeenCalledTimes(1);
    finish();
    expect(run).toHaveBeenCalledTimes(2);
    finish();
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('ignores a second done, so a stray call cannot start a run beside the follow-up', () => {
    const dones = [];
    const run = vi.fn((done) => dones.push(done));
    const trigger = createSerialRunner(run);
    trigger();
    trigger();
    dones[0]();
    expect(run).toHaveBeenCalledTimes(2);
    dones[0]();
    trigger();
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('releases the lock when a run throws, so later triggers still run', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const run = vi.fn(() => {
      throw new Error('spawn failed');
    });
    const trigger = createSerialRunner(run);
    trigger();
    trigger();
    expect(run).toHaveBeenCalledTimes(2);
    error.mockRestore();
  });

  it('runs again after a finished run', () => {
    const { run, finish } = recordingTask();
    const trigger = createSerialRunner(run);
    trigger();
    finish();
    trigger();
    expect(run).toHaveBeenCalledTimes(2);
  });
});
