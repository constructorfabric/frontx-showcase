// Deploys never overlap: GitHub delivers at least once, so duplicate and close deliveries are routine, and two concurrent pulls of the same image can leave a half-extracted layer. Every deploy pulls the same `latest` tag, so the deliveries that arrive during a deploy are coalesced into one follow-up run.

/**
 * Wraps `run(done)` so it never runs twice at once. `run` must call `done()` on every exit path; a second call is ignored, and a synchronous throw counts as done. `onCoalesce` is called once per queued follow-up, not once per trigger.
 * The in-memory flag is enough because the webhook is one Node process; more replicas would need a real lock.
 * @param {(done: () => void) => void} run
 * @param {() => void} [onCoalesce]
 * @returns {() => void} the trigger
 */
export function createSerialRunner(run, onCoalesce) {
  let running = false;
  let queued = false;

  function start() {
    running = true;
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      running = false;
      if (queued) {
        queued = false;
        start();
      }
    };
    try {
      run(done);
    } catch (error) {
      // A run that throws before it can call done must not hold the lock.
      console.error('deploy failed:', error);
      done();
    }
  }

  return function trigger() {
    if (running) {
      if (!queued) onCoalesce?.();
      queued = true;
      return;
    }
    start();
  };
}
