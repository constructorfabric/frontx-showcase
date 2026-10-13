import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import { frontxMfGts } from '@gears-frontx/frontx-template-shell/build/mf-gts';

// The routing packages are shared so that `<ExtensionRouter>` (inside @gears-frontx/react) and each screen's route tree use one router copy and one router context.
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
      name: 'demoMfe',
      filename: 'remoteEntry.js',
      exposes: {
        './lifecycle-helloworld': './src/lifecycle-helloworld.tsx',
        './lifecycle-profile': './src/lifecycle-profile.tsx',
        './lifecycle-theme': './src/lifecycle-theme.tsx',
        './lifecycle-widgets-host': './src/lifecycle-widgets-host.tsx',
      },
      // Empty shared config - MF 2.0's shared dep mechanism is bypassed.
      // Shared deps are externalized via rollupOptions.external and provided
      // at runtime by the handler's bare-specifier rewriting.
      shared: {},
      // mf-manifest.json must be generated alongside remoteEntry.js so that
      // MfeHandlerMF can discover expose chunk paths without regex-parsing the bundle.
      manifest: true,
      // The four screen entries share the package's blocks and the kit candidates, so Rollup puts their stylesheets in chunks shared across exposes, which the manifest attributes to no expose and the host would never inject. Every expose is attributed the package's whole CSS instead.
      bundleAllCSS: true,
    }),
    frontxMfGts(),
  ],
  build: {
    target: 'esnext',
    modulePreload: false,
    minify: true,
    cssCodeSplit: true,
    rollupOptions: {
      // Preserve bare specifiers for shared deps in the output chunks.
      // The handler rewrites these to blob URLs at runtime.
      external: sharedDeps,
    },
  },
});
