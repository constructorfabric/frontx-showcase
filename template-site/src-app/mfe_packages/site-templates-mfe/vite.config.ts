import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import { frontxMfGts } from '@gears-frontx/frontx-template-shell/build/mf-gts';

const here = path.dirname(fileURLToPath(import.meta.url));

// Externalized and built by frontxMfGts() as standalone modules the MFE handler links at runtime. The routing packages are among them so that `<ExtensionRouter>` (from @gears-frontx/react) and this package's route tree share one router copy and its React context.
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
  plugins: [
    react(),
    federation({
      name: 'siteTemplatesMfe',
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
  resolve: {
    // The site's content model and links in this template's shared folder, bundled into each package's build.
    alias: { '@site-shared': path.resolve(here, '../shared/site') },
    // The shared folder sits outside the package: without dedupe its imports resolve upward from its own directory and could reach other copies than the versions this package pins.
    dedupe: ['@gears-frontx/ui-kit', 'lucide-react', '@gears-frontx/routing', '@gears-frontx/routing-tanstack'],
  },
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
