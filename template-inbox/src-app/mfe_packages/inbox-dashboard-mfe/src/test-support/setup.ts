/**
 * This package's Vitest setup: the shell's app that owns the page's query cache, built in a runtime of its own first (`startTestHost`), then the inbox packages' shared platform and per-test resets (`@inbox-shared/test-support/setup`), with this package's mock backend put back to its seed after each test. Everything else is imported after the host, so the suite and these resets share one copy of every module.
 */
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { clearSharedQueryCache, startTestHost } from '@inbox-shared/test-support/frontxTestHost';

await startTestHost(vi);

const { resetInboxMockState } = await import('@inbox-shared/api/mockStore');
const { registerInboxTestSetup } = await import('@inbox-shared/test-support/setup');

registerInboxTestSetup({
  afterEach,
  vi,
  cleanup,
  resetMockState: resetInboxMockState,
  clearQueryCache: clearSharedQueryCache,
});
