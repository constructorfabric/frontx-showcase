import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import { frontxMfGts } from '@gears-frontx/frontx-template-shell/build/mf-gts';

const here = path.dirname(fileURLToPath(import.meta.url));

// Externalized and built by frontxMfGts() as standalone modules the MFE handler links at runtime. The routing packages are among them so that `<ExtensionRouter>` (inside @gears-frontx/react) and the screen's route tree use one router copy and one router context.
const sharedDeps = [
  'react',
  'react-dom',
  '@gears-frontx/react',
  '@gears-frontx/framework',
  '@gears-frontx/state',
  '@gears-frontx/mfes',
  '@gears-frontx/gts-plugin',
  '@gears-frontx/api',
  '@gears-frontx/i18n',
  '@gears-frontx/routing',
  '@gears-frontx/routing-tanstack',
  '@tanstack/react-query',
  '@reduxjs/toolkit',
  'react-redux',
];

export default defineConfig({
  resolve: {
    // The inbox's cross-screen code in this template's shared folder, bundled into each package's build.
    alias: { '@inbox-shared': path.resolve(here, '../shared/inbox') },
    // The shared folder sits outside the package: without dedupe its imports resolve upward from its own directory and could reach the application root's copies instead of the versions this package pins.
    dedupe: ['@gears-frontx/ui-kit', 'lucide-react', '@gears-frontx/routing', '@gears-frontx/routing-tanstack'],
  },
  plugins: [
    react(),
    federation({
      name: 'inboxContactsMfe',
      filename: 'remoteEntry.js',
      exposes: {
        './lifecycle': './src/lifecycle.tsx',
      },
      // Empty on purpose: shared dependencies are externalized below and linked by the MFE handler at runtime.
      shared: {},
      // mf-manifest.json is what the host's MFE handler reads to find the expose chunks and their CSS.
      manifest: true,
    }),
    frontxMfGts(),
  ],
  build: {
    target: 'esnext',
    modulePreload: false,
    minify: true,
    cssCodeSplit: true,
    rollupOptions: {
      external: sharedDeps,
    },
  },
});
