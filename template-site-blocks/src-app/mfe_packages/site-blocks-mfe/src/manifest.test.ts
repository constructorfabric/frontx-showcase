import { describe, expect, it } from 'vitest';
import manifest from '../mfe.json';
import pkg from '../package.json';
import viteConfig from '../vite.config.ts?raw';
import { blocksRouteTree } from './routes';
import { routeTreePaths } from './test-support/routeTreePaths';
import en from './screens/blocks/i18n/en.json';

const GTS_ID = /^gts(\.[a-z][a-z0-9_]*){4}\.v\d+(~[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){3}\.v\d+)*~?$/;
const SCREEN_DOMAIN = 'gts.frontx.mfes.ext.domain.v1~frontx.screensets.layout.screen.v1';
const TOKEN = /^[a-z][a-z0-9-]*$/;

type RouteSeo = { title?: string; description?: string; indexable?: boolean };
type Extension = { id: string; domain: string; route: string; presentation: unknown; seo: RouteSeo & { routes?: Record<string, RouteSeo> } };

const [blocks] = manifest.extensions as Extension[];

/** template-mfe's shared set plus the two routing packages, in this order, in every package of the site (the site's uniform screen package shape). */
const SHARED_DEPS = ['react', 'react-dom', '@gears-frontx/react', '@gears-frontx/framework', '@gears-frontx/state', '@gears-frontx/mfes', '@gears-frontx/gts-plugin', '@gears-frontx/api', '@gears-frontx/i18n', '@gears-frontx/routing', '@gears-frontx/routing-tanstack', '@tanstack/react-query', '@reduxjs/toolkit', 'react-redux'];

describe('site-blocks-mfe mfe.json', () => {
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
  });

  it('serves the remote from the port the package previews on', () => {
    const port = /--port (\d+)/.exec(pkg.scripts.preview)?.[1];
    expect(manifest.manifest.remoteEntry).toBe(`http://localhost:${port}/assets/remoteEntry.js`);
  });

  it('declares the blocks screen in the menu next to the UI Kit', () => {
    expect(manifest.extensions).toHaveLength(1);
    expect(blocks?.domain).toBe(SCREEN_DOMAIN);
    expect(blocks?.route).toBe('/blocks');
    expect(blocks?.route.slice(1)).toMatch(TOKEN);
    expect(blocks?.presentation).toEqual({ label: 'Blocks', icon: 'lucide:blocks', order: 31 });
  });

  it('keeps every page out of the index and declares metadata for each route of the tree', () => {
    expect(routeTreePaths(blocksRouteTree)).toEqual(['/', '/$block']);
    expect(Object.keys(blocks?.seo.routes ?? {})).toEqual(['/$block']);
    expect(blocks?.seo.indexable).toBe(false);
    for (const route of Object.values(blocks?.seo.routes ?? {})) expect(route.indexable).toBe(false);
  });

  it('titles the index with its heading text and describes each page in 50 to 160 characters', () => {
    expect(blocks?.seo.title).toBe(en.index_title);
    for (const seo of [blocks?.seo, ...Object.values(blocks?.seo.routes ?? {})]) {
      expect(seo?.description?.length).toBeGreaterThanOrEqual(50);
      expect(seo?.description?.length).toBeLessThanOrEqual(160);
    }
  });
});
