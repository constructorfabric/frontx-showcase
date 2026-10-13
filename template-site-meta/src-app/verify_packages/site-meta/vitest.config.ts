// The package's own test lane: Node, no DOM (the head-sync bundle test builds its own jsdom window). The package needs nothing from the project around it.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    testTimeout: 30000,
  },
});
