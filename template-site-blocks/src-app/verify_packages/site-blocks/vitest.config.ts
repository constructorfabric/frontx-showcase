// The package's own test lane: jsdom with the kit's CSS processed, so a block test sees the kit's real class names and the block's own CSS Module classes. The package needs nothing from the project around it.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Brand art is TSX in a package whose tsconfig is a Node one; the automatic JSX runtime is set here for every file the tests load.
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test-support/setup.ts'],
    execArgv: Number.parseInt(process.versions.node.split('.')[0] ?? '0', 10) >= 25 ? ['--no-experimental-webstorage'] : [],
    css: { include: [/.+/] },
    server: {
      deps: {
        // The kit's emitted chunks import their own stylesheets; inlined, those imports go through Vite's CSS pipeline instead of Node's loader, which has no `.css` handler.
        inline: ['@gears-frontx/ui-kit', '@gears-frontx/kit-candidates', '@gears-frontx/site-brand'],
      },
    },
  },
});
