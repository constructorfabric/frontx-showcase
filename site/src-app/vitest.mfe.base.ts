import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import {
  COLD_START_TIMEOUT_MS,
  COVERAGE_EXCLUDE,
  COVERAGE_THRESHOLDS,
  DEFAULT_TEST_EXCLUDE,
  SHARED_VITEST_SETUP_FILES,
  TEST_INCLUDE_TSX,
  vitestNodeWorkerExecArgv,
} from '../vitest.shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


/**
 * Shared test-only helpers live at the top-level `src/__test-utils__/` boundary
 * so host and MFE tests consume the same helpers without coupling to the
 * `src/mfe_packages/shared/` runtime tree.
 */
const frontxTestUtilsRoot = path.resolve(__dirname, './__test-utils__');

/**
 * How many shared cold-start budgets the first test of an MFE package gets.
 *
 * An MFE package that renders the kit inlines `@gears-frontx/ui-kit` with CSS
 * processing on, one CSS Module per component, so its cold transform is
 * several times the host's. Every worker waits on that same transform, and a
 * first test that imports a screen pays it inside its own budget. On a loaded
 * machine (load average 16, a dev server beside the run) a full `test:unit`
 * measured 85 s of import across workers, and four first tests crossed the
 * shared 30 s; the same tests take about 10 s cold at load average 8 and
 * under 2 s warm. Four budgets cover the loaded case; a test that never
 * settles still fails.
 */
const MFE_COLD_START_FACTOR = 4;

export const mfeVitestBaseConfig = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@frontx-test-utils': frontxTestUtilsRoot,
    },
    dedupe: ['react', 'react-dom'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: false,
    execArgv: vitestNodeWorkerExecArgv(),
    setupFiles: [...SHARED_VITEST_SETUP_FILES],
    // A newly scaffolded MFE package pays its whole Vite transform inside the
    // first test's own budget; see COLD_START_TIMEOUT_MS and the factor below.
    testTimeout: COLD_START_TIMEOUT_MS * MFE_COLD_START_FACTOR,
    hookTimeout: COLD_START_TIMEOUT_MS * MFE_COLD_START_FACTOR,
    include: [...TEST_INCLUDE_TSX],
    exclude: [...DEFAULT_TEST_EXCLUDE],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [...COVERAGE_EXCLUDE],
      thresholds: { ...COVERAGE_THRESHOLDS },
    },
  },
});

export function defineMfeProject(rootDir: string) {
  return mergeConfig(
    mfeVitestBaseConfig,
    defineConfig({
      root: rootDir,
    }),
  );
}
