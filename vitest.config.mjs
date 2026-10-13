// Tests of the repository tooling: scripts/*.test.mjs. Template packages, the template-delivered site-meta package among them, are tested by the site's own test:unit after composition.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['scripts/**/*.test.mjs'],
    exclude: ['**/node_modules/**', '**/dist/**', 'site/**', 'template-*/**'],
    passWithNoTests: false,
  },
});
