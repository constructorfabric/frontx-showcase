import { describe, expect, it } from 'vitest';
import { SHOW_COMPONENT_ACTION } from './frame/showComponent';
import manifest from '../mfe.json';
import pkg from '../package.json';
import viteConfig from '../vite.config.ts?raw';
import { COMPONENTS, FOUNDATIONS } from './catalog';
import { catalogueRouteTree } from './routes';
import en from './screens/catalogue/i18n/en.json';
import { routeTreePaths } from './test-support/routeTreePaths';

const GTS_ID = /^gts(\.[a-z][a-z0-9_]*){4}\.v\d+(~[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){3}\.v\d+)*~?$/;
const SCREEN_DOMAIN = 'gts.frontx.mfes.ext.domain.v1~frontx.screensets.layout.screen.v1';
const TOKEN = /^[a-z][a-z0-9-]*$/;

type RouteSeo = { title?: string; description?: string; indexable?: boolean };
type Extension = { id: string; domain: string; route: string; presentation: unknown; seo: { title: string; description: string; routes: Record<string, RouteSeo> } };

const [catalogue] = manifest.extensions as Extension[];
const strings: Record<string, string> = en;

/** The entries each pattern route of the tree serves: the route's page component renders a page for these slugs and the not-found page for any other. */
const ENTRIES_OF_PATTERN: Record<string, ReadonlyArray<{ slug: string; path: string; labelKey: string }>> = {
  '/components/$slug': COMPONENTS,
  '/foundations/$slug': FOUNDATIONS,
};

/** Every page of the route tree: its static paths, and each pattern route expanded over the entries it serves. */
function routeTreePages(): string[] {
  return routeTreePaths(catalogueRouteTree)
    .flatMap((path) => ENTRIES_OF_PATTERN[path]?.map((entry) => entry.path) ?? [path])
    .sort();
}

/** template-mfe's shared set plus the two routing packages, in this order, in every package of the site (the site's uniform screen package shape). */
const SHARED_DEPS = ['react', 'react-dom', '@gears-frontx/react', '@gears-frontx/framework', '@gears-frontx/state', '@gears-frontx/mfes', '@gears-frontx/gts-plugin', '@gears-frontx/api', '@gears-frontx/i18n', '@gears-frontx/routing', '@gears-frontx/routing-tanstack', '@tanstack/react-query', '@reduxjs/toolkit', 'react-redux'];

describe('catalogue-mfe mfe.json', () => {
  it('declares its show_component action on its entry, with a closed schema that names every component by its slug and targets only the catalogue screen', () => {
    expect(manifest.entries.map((entry) => entry.actions)).toEqual([[SHOW_COMPONENT_ACTION]]);
    expect(manifest.schemas).toHaveLength(1);
    const [schema] = manifest.schemas;
    expect(schema?.$id).toBe(`gts://${SHOW_COMPONENT_ACTION}`);
    expect(schema?.additionalProperties).toBe(false);
    expect(schema?.properties.payload.additionalProperties).toBe(false);
    expect(schema?.properties.target['x-gts-ref']).toBe(manifest.extensions[0]?.id);
    expect(schema?.properties.payload.required).toEqual(['component']);
    expect(schema?.properties.payload.properties.component.enum).toEqual(COMPONENTS.map((entry) => entry.slug));
  });

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
    const port = /--port (\d+)/.exec(pkg.scripts.preview)?.[1];
    expect(manifest.manifest.remoteEntry).toBe(`http://localhost:${port}/assets/remoteEntry.js`);
  });

  it('declares the catalogue screen: token, menu entry', () => {
    expect(manifest.extensions).toHaveLength(1);
    expect(catalogue?.domain).toBe(SCREEN_DOMAIN);
    expect(catalogue?.route).toBe('/catalogue');
    expect(catalogue?.route.slice(1)).toMatch(TOKEN);
    expect(catalogue?.presentation).toEqual({ label: 'UI Kit', icon: 'lucide:component', order: 30 });
  });

  it('declares metadata for exactly the pages of the route tree: the screen for `/`, seo.routes for the others', () => {
    const declared = ['/', ...Object.keys(catalogue?.seo.routes ?? {})];
    expect(declared.sort()).toEqual(routeTreePages());
  });

  it("titles every page's metadata with the label its navigation row and page heading show", () => {
    for (const entries of Object.values(ENTRIES_OF_PATTERN)) {
      for (const entry of entries) expect(catalogue?.seo.routes[entry.path]?.title, entry.path).toBe(strings[entry.labelKey]);
    }
  });

  it('gives every page a unique title and a 50 to 160 character description', () => {
    const pages: RouteSeo[] = [catalogue!.seo, ...Object.values(catalogue!.seo.routes)];
    for (const page of pages) {
      expect(page.title).toBeTruthy();
      expect(page.description?.length).toBeGreaterThanOrEqual(50);
      expect(page.description?.length).toBeLessThanOrEqual(160);
    }
    expect(new Set(pages.map((page) => page.title)).size).toBe(pages.length);
  });
});
