import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

/** What the dev server reads from the site-meta package (template-site-meta): `devTwin` and `sitePaths` of its `src/dev.ts`. */
type DevModule = {
  devTwin: (paths: unknown, origin: string, requestPath: string) => { content: string; contentType: string } | undefined;
  sitePaths: (project: string, config?: string) => unknown;
};

function isDevModule(value: unknown): value is DevModule {
  return typeof value === 'object' && value !== null && 'devTwin' in value && typeof value.devTwin === 'function' && 'sitePaths' in value && typeof value.sitePaths === 'function';
}

/**
 * Serves the pages' plain-text twins (`/docs/get-started.md`) in dev, rendered from the current sources on each request, with the content type the site-meta package names (`text/plain; charset=utf-8`, which a browser shows in the tab), so the "Plain-text version" links work as they do in a build, where `seo:generate` writes the files into `dist/`. Without it the SPA fallback answers such a path with the app. The site config is the repository's `site.config.json`, next to this project. A project without the site-meta package serves no twins.
 */
function plainTextTwins(): Plugin {
  const devModule = path.join(__dirname, 'src-app/verify_packages/site-meta/src/dev.ts');
  const config = path.resolve(__dirname, '..', 'site.config.json');
  return {
    name: 'frontx-site:plain-text-twins',
    apply: 'serve',
    configureServer(server) {
      if (!fs.existsSync(devModule)) return;
      server.middlewares.use((req, res, next) => {
        const requestPath = (req.url ?? '').split('?')[0] ?? '';
        if (req.method !== 'GET' || !requestPath.endsWith('.md')) return next();
        import(pathToFileURL(devModule).href)
          .then((module: unknown) => {
            if (!isDevModule(module)) throw new Error(`${devModule} exports no devTwin and sitePaths`);
            const twin = module.devTwin(module.sitePaths(__dirname, config), `http://${req.headers.host ?? 'localhost'}`, decodeURIComponent(requestPath));
            if (!twin) return next();
            res.setHeader('Content-Type', twin.contentType);
            res.end(twin.content);
          })
          .catch(next);
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  // A relative base makes the build location-independent: the site addresses screens in the query string, so the document is always served from the folder it was deployed to, the root of an origin or any sub-path, and every asset resolves next to it. The dev server keeps `/`.
  base: './',
  plugins: [
    plainTextTwins(),
    react(),
    federation({
      name: 'host',
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
        // Same React Query instance as the host when remotes use federation scope;
        // separately mounted MFEs still receive the host QueryClient via runtime mount context.
        '@tanstack/react-query': {
          singleton: true,
          requiredVersion: '^5.90.0',
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src-app'),
    },
    dedupe: ['@gears-frontx/api', '@gears-frontx/framework', '@gears-frontx/react'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', '@globaltypesystem/gts-ts'],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split node_modules into vendor chunks
          if (id.includes('node_modules')) {
            // Split React and React DOM separately
            if (id.includes('react-dom')) {
              return 'vendor-react-dom';
            }
            if (id.includes('react/') || id.includes('react\\')) {
              return 'vendor-react';
            }

            // Split large charting library
            if (id.includes('recharts')) {
              return 'vendor-recharts';
            }

            // Split date libraries
            if (id.includes('date-fns') || id.includes('react-day-picker')) {
              return 'vendor-dates';
            }

            // Split carousel library
            if (id.includes('embla-carousel')) {
              return 'vendor-embla';
            }

            // Split drawer library
            if (id.includes('vaul')) {
              return 'vendor-vaul';
            }

            // Split OTP library
            if (id.includes('input-otp')) {
              return 'vendor-input-otp';
            }

            // Split form libraries (react-hook-form + zod + resolvers)
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'vendor-forms';
            }

            // Split Radix UI primitives (they're relatively small individually but many)
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }

            // Split other large utilities
            if (id.includes('lodash')) {
              return 'vendor-lodash';
            }

            // All other node_modules go to vendor chunk
            return 'vendor';
          }

          // Split framework and react packages into separate chunk
          if (id.includes('@gears-frontx/framework') || id.includes('@gears-frontx/react')) {
            return 'frontx-core';
          }
          // Split React and React DOM
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react';
          }
        },
      },
    },
    // Increase chunk size warning limit or disable it
    chunkSizeWarningLimit: 500,
  },
});
