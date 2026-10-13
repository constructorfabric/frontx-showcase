// Two test lanes, one per kind of code the package ships. The check lane runs the generator and the check in Node with no DOM, on fixtures; the one test of the shipped record reads the kit stylesheet the project installs and is skipped where none is installed. The art lane renders the art components in jsdom with the kit's CSS processed, so a test sees the real class names.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'check',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        // The package's tsconfig is the Node one of the check; the art's JSX runtime is set here.
        esbuild: { jsx: 'automatic' },
        test: {
          name: 'art',
          environment: 'jsdom',
          include: ['src/art/**/*.test.tsx'],
          setupFiles: ['./src/test-support/art-setup.ts'],
          execArgv: Number.parseInt(process.versions.node.split('.')[0] ?? '0', 10) >= 25 ? ['--no-experimental-webstorage'] : [],
          css: { include: [/.+/] },
          server: {
            deps: {
              // The kit's emitted chunks import their own stylesheets; inlined, those imports go through Vite's CSS pipeline instead of Node's loader, which has no `.css` handler.
              inline: ['@gears-frontx/ui-kit'],
            },
          },
        },
      },
    ],
  },
});
