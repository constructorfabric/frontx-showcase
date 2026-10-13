/// <reference types="node" />
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vitest/config';
import { defineMfeProject } from '../../vitest.mfe.base';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default mergeConfig(
  defineMfeProject(__dirname),
  defineConfig({
    test: {
      // The widget renders kit components: CSS processing gives their CSS Modules real class names in the tests.
      css: true,
      server: {
        deps: {
          // @gears-frontx/ui-kit ships one CSS Module per component, each imported by its emitted chunk; left external, Node's ESM loader fails on the `.css` import, so Vite processes the package instead.
          inline: ['@gears-frontx/ui-kit'],
        },
      },
    },
  })
);
