import { describe, expect, it } from 'vitest';
import { SITE_SCREEN_EXTENSIONS } from '@site-shared/navigation/siteScreens';
import manifest from '../mfe.json';
import pkg from '../package.json';
import viteConfig from '../vite.config.ts?raw';
import { libsRouteTree } from './routes';
import { routeTreePaths } from './test-support/routeTreePaths';

const GTS_ID = /^gts(\.[a-z][a-z0-9_]*){4}\.v\d+(~[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){3}\.v\d+)*~?$/;
const SCREEN_DOMAIN = 'gts.frontx.mfes.ext.domain.v1~frontx.screensets.layout.screen.v1';
const TOKEN = /^[a-z][a-z0-9-]*$/;
/** template-mfe's shared set plus the two routing packages, in this order, in every package of the site (the site's uniform screen package shape). */
const SHARED_DEPS = ['react', 'react-dom', '@gears-frontx/react', '@gears-frontx/framework', '@gears-frontx/state', '@gears-frontx/mfes', '@gears-frontx/gts-plugin', '@gears-frontx/api', '@gears-frontx/i18n', '@gears-frontx/routing', '@gears-frontx/routing-tanstack', '@tanstack/react-query', '@reduxjs/toolkit', 'react-redux'];

type SeoBlock = { title?: string; description?: string; routes?: Record<string, { title?: string; description?: string; indexable?: boolean }> };
type Extension = (typeof manifest.extensions)[number] & { seo?: SeoBlock; route: string };

const screens = (manifest.extensions as Extension[]).filter((extension) => extension.domain === SCREEN_DOMAIN);

describe('mfe.json', () => {
  it('carries GTS ids that parse, and entries that name this manifest', () => {
    for (const id of [manifest.manifest.id, ...manifest.entries.map((entry) => entry.id), ...manifest.extensions.map((extension) => extension.id)]) {
      expect(id).toMatch(GTS_ID);
    }
    for (const entry of manifest.entries) expect(entry.manifest).toBe(manifest.manifest.id);
    expect(manifest.entries.map((entry) => entry.exposedModule)).toEqual(['./lifecycle']);
  });

  it('declares no action: the screen shows no page on request from another screen', () => {
    expect(manifest.entries.map((entry) => entry.actions)).toEqual([[]]);
    expect('schemas' in manifest).toBe(false);
  });

  it('declares its screen under the extension id the site content opens it by', () => {
    expect(manifest.extensions.map((extension) => extension.id)).toEqual([SITE_SCREEN_EXTENSIONS.libs]);
  });

  it('is product content, not a template example', () => {
    expect('templateExample' in manifest).toBe(false);
  });

  it('serves the remote from the port the package previews on', () => {
    const port = /--port (\d+)/.exec(pkg.scripts.preview)?.[1];
    expect(manifest.manifest.remoteEntry).toBe(`http://localhost:${port}/assets/remoteEntry.js`);
  });

  it('declares shared dependencies the template-mfe way: none in mfe.json, the shared set externalized in vite.config.ts', () => {
    expect(Object.keys(manifest.manifest).sort()).toEqual(['id', 'remoteEntry']);
    expect(JSON.stringify(manifest)).not.toMatch(/"shared"/);
    const declared = /const sharedDeps = \[([\s\S]*?)\];/.exec(viteConfig)?.[1] ?? '';
    expect(declared.match(/'[^']+'/g)?.map((name) => name.slice(1, -1))).toEqual(SHARED_DEPS);
    expect(viteConfig).toMatch(/shared: \{\},/);
    expect(viteConfig).toMatch(/external: sharedDeps,/);
  });

  it('declares the libs screen with its token, its place between UI Kit and Docs in the menu and its page metadata', () => {
    expect(screens).toHaveLength(1);
    const [libs] = screens;
    expect(libs?.route).toBe('/libs');
    expect(libs?.route.slice(1)).toMatch(TOKEN);
    expect(libs?.presentation).toEqual({ label: 'Libraries', icon: 'lucide:library', order: 35 });
    expect(libs?.seo?.title).toBeTruthy();
    for (const seo of [libs?.seo, ...Object.values(libs?.seo?.routes ?? {})]) {
      expect(seo?.title).toBeTruthy();
      expect(seo?.description?.length).toBeGreaterThanOrEqual(50);
      expect(seo?.description?.length).toBeLessThanOrEqual(160);
    }
  });

  it('declares page metadata for exactly the pages of its route tree', () => {
    const [libs] = screens;
    const declared = ['/', ...Object.keys(libs?.seo?.routes ?? {})];
    expect(declared.sort()).toEqual(routeTreePaths(libsRouteTree));
  });
});
