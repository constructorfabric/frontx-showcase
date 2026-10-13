/// <reference types="node" />
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vitest/config';
import { defineMfeProject } from '../../vitest.mfe.base';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default mergeConfig(
  defineMfeProject(__dirname),
  defineConfig({
    resolve: {
      alias: { '@inbox-shared': path.resolve(__dirname, '../shared/inbox') },
      dedupe: ['@gears-frontx/ui-kit', 'lucide-react', '@gears-frontx/routing', '@gears-frontx/routing-tanstack'],
    },
    test: {
      // The inbox's own browser surface and per-test resets, after the shell's. `test-support/`, not `__test-utils__/`: the shell's lint reads an import of `../_*` from inside an MFE package as one into a sibling package.
      setupFiles: ['./src/test-support/setup.ts'],
      // Stylesheet imports resolve to their real content, which the token re-anchoring and the lifecycle's shadow-root style tests read.
      css: true,
      server: {
        deps: {
          // The kit's component chunks import their own CSS Modules; inlining hands them to Vite instead of Node's ESM loader.
          inline: ['@gears-frontx/ui-kit'],
        },
      },
    },
  })
);
