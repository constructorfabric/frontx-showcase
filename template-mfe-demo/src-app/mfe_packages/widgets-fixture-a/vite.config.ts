import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import { frontxMfGts } from '@gears-frontx/frontx-template-shell/build/mf-gts';

// Externalized and built by frontxMfGts() as standalone modules the MFE handler links at runtime: the shared set every package of the site uses. The routing packages are in it because this widget imports routing-tanstack hooks (useSearch) directly and <ExtensionRouter> (@gears-frontx/react) builds the router those hooks read; bundled, each would carry its own copy of the router and the hook's context lookup would miss the router <ExtensionRouter> built.
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
      name: 'widgetsFixtureA',
      filename: 'remoteEntry.js',
      exposes: {
        './lifecycle': './src/lifecycle.tsx',
      },
      shared: {},
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
