import { describe, expect, it } from 'vitest';
import { resolveNavigationHistory } from '@gears-frontx/routing';
import { adaptProviderHistory, createRouter, type AnyRoute } from '@gears-frontx/routing-tanstack';

const GTS_ID = /^gts(\.[a-z][a-z0-9_]*){4}\.v\d+(~[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){3}\.v\d+)*~?$/;
const SCREEN_DOMAIN = 'gts.frontx.mfes.ext.domain.v1~frontx.screensets.layout.screen.v1';
const TOKEN = /^[a-z][a-z0-9-]*$/;
/** The shell's screen extension type. */
const SCREEN_TYPE = 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~';
/** The site host's demos navigation group, an instance of the shell's nav group type. */
const DEMOS_GROUP = 'gts.frontx.screensets.layout.nav_group.v1~frontx.site.layout.demos.v1';

type RouteSeo = { title?: string; description?: string; indexable?: boolean };
type Manifest = {
  schemas?: { $id: string }[];
  manifest: { id: string; remoteEntry: string };
  entries: { id: string; manifest: string; exposedModule: string }[];
  extensions: { id: string; domain: string; route: string; presentation: { label: string; order: number; group?: string }; seo?: RouteSeo & { routes?: Record<string, RouteSeo> } }[];
};

/** The paths of a route tree's pages, as the router registers them (pathless layout routes excluded). */
export function routeTreePaths(routeTree: AnyRoute): string[] {
  const router = createRouter({ routeTree, history: adaptProviderHistory(resolveNavigationHistory(), undefined) });
  return Object.keys(router.routesByPath)
    .filter((path) => path !== '')
    .sort();
}

/** template-mfe's shared set plus the two routing packages, in this order, in every package of the site (the site's uniform screen package shape). */
const SHARED_DEPS = ['react', 'react-dom', '@gears-frontx/react', '@gears-frontx/framework', '@gears-frontx/state', '@gears-frontx/mfes', '@gears-frontx/gts-plugin', '@gears-frontx/api', '@gears-frontx/i18n', '@gears-frontx/routing', '@gears-frontx/routing-tanstack', '@tanstack/react-query', '@reduxjs/toolkit', 'react-redux'];

/**
 * Holds one inbox package's `mfe.json` to the uniform shape: GTS ids, the remote port, no shared dependencies in mfe.json and the shared set externalized in vite.config.ts, one screen extension with its token and menu order, and page metadata declared for exactly the pages of its route tree.
 */
export function describeScreenManifest(options: { manifest: Manifest; preview: string; token: string; order: number; routeTree: AnyRoute; viteConfig: string }) {
  const { manifest, preview, token, order, routeTree, viteConfig } = options;
  describe('mfe.json', () => {
    it('declares shared dependencies the template-mfe way: none in mfe.json, the shared set externalized in vite.config.ts', () => {
      expect(Object.keys(manifest.manifest).sort()).toEqual(['id', 'remoteEntry']);
      expect(JSON.stringify(manifest)).not.toMatch(/"shared"/);
      const declared = /const sharedDeps = \[([\s\S]*?)\];/.exec(viteConfig)?.[1] ?? '';
      expect(declared.match(/'[^']+'/g)?.map((name) => name.slice(1, -1))).toEqual(SHARED_DEPS);
      expect(viteConfig).toMatch(/shared: \{\},/);
      expect(viteConfig).toMatch(/external: sharedDeps,/);
    });

    it('carries GTS ids that parse, one entry exposing ./lifecycle', () => {
      for (const id of [manifest.manifest.id, ...manifest.entries.map((entry) => entry.id), ...manifest.extensions.map((extension) => extension.id)]) {
        expect(id).toMatch(GTS_ID);
      }
      expect(manifest.entries.map((entry) => [entry.manifest, entry.exposedModule])).toEqual([[manifest.manifest.id, './lifecycle']]);
      expect('templateExample' in manifest).toBe(false);
    });

    it('serves the remote from the port the package previews on', () => {
      const port = /--port (\d+)/.exec(preview)?.[1];
      expect(manifest.manifest.remoteEntry).toBe(`http://localhost:${port}/assets/remoteEntry.js`);
    });

    it(`declares the ${token} screen at menu order ${order} in the demos group`, () => {
      expect(manifest.extensions).toHaveLength(1);
      expect(manifest.extensions[0]?.domain).toBe(SCREEN_DOMAIN);
      expect(manifest.extensions[0]?.route).toBe(`/${token}`);
      expect(manifest.extensions[0]?.route.slice(1)).toMatch(TOKEN);
      expect(manifest.extensions[0]?.presentation.order).toBe(order);
      expect(manifest.extensions[0]?.presentation.group).toBe(DEMOS_GROUP);
    });

    it("declares the screen as the shell's screen extension type and carries no screen type schema", () => {
      expect(manifest.extensions[0]?.id.startsWith(SCREEN_TYPE)).toBe(true);
      expect((manifest.schemas ?? []).filter((schema) => schema.$id.startsWith(`gts://${SCREEN_TYPE}`))).toEqual([]);
    });

    it('declares page metadata for exactly the pages of its route tree', () => {
      const seo = manifest.extensions[0]?.seo;
      expect(seo?.title).toBeTruthy();
      expect(seo?.description?.length).toBeGreaterThanOrEqual(50);
      expect(seo?.description?.length).toBeLessThanOrEqual(160);
      const declared = ['/', ...Object.keys(seo?.routes ?? {})];
      expect(declared.sort()).toEqual(routeTreePaths(routeTree));
      for (const [path, page] of Object.entries(seo?.routes ?? {})) {
        // A pattern route is a template for many addresses, never one indexable page.
        if (path.includes('$')) expect(page.indexable, path).toBe(false);
      }
    });
  });
}
