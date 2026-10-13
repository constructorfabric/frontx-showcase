// Unmounts what an art test rendered, so the next test's queries and its axe run see only its own markup. jsdom has no ResizeObserver, which the kit's chart container needs.
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

class NoResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

if (!('ResizeObserver' in globalThis)) {
  Object.defineProperty(globalThis, 'ResizeObserver', { value: NoResizeObserver, configurable: true });
}

afterEach(cleanup);
