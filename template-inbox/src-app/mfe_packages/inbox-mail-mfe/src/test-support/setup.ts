/**
 * This package's Vitest setup: the shell's app that owns the page's query cache, built in a runtime of its own first (`startTestHost`), then the inbox packages' shared platform and per-test resets (`@inbox-shared/test-support/setup`), with this package's mock backend put back to its seed and its slice to its initial state after each test. Everything else is imported after the host, so the suite and these resets share one copy of every module.
 */
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { clearSharedQueryCache, startTestHost } from '@inbox-shared/test-support/frontxTestHost';

await startTestHost(vi);

const { getStore } = await import('@gears-frontx/react');
const { resetMailMockState } = await import('../api/mailMockStore');
const { registerInboxTestSetup } = await import('@inbox-shared/test-support/setup');
const { mailStateReset } = await import('../slices/mailSlice');

registerInboxTestSetup({
  afterEach,
  vi,
  cleanup,
  resetScreenState: () => getStore().dispatch(mailStateReset()),
  resetMockState: resetMailMockState,
  clearQueryCache: clearSharedQueryCache,
});
