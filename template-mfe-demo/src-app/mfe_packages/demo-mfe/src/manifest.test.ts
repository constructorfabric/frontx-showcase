import { describe, expect, it } from 'vitest';
import { FRONTX_SCREEN_EXTENSION_TYPE, gtsPlugin } from '@gears-frontx/react';
import { extensionScreenSchema, navGroupSchema } from '@gears-frontx/frontx-template-shell';
import manifest from '../mfe.json';
import pkg from '../package.json';
import viteConfig from '../vite.config.ts?raw';
import type { AnyRoute } from '@gears-frontx/routing-tanstack';
import { helloworldRouteTree } from './routes-helloworld';
import { profileRouteTree } from './routes-profile';
import { themeRouteTree } from './routes-theme';
import { widgetsHostRouteTree } from './routes-widgets-host';
import { routeTreePaths } from './test-support/routeTreePaths';
import { DEMOS_NAV_GROUP_ID, HELLOWORLD_EXTENSION_ID, PROFILE_EXTENSION_ID, THEME_EXTENSION_ID, WIDGETS_HOST_EXTENSION_ID } from './shared/extension-ids';

const GTS_ID = /^gts(\.[a-z][a-z0-9_]*){4}\.v\d+(~[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){3}\.v\d+)*~?$/;
const SCREEN_DOMAIN = 'gts.frontx.mfes.ext.domain.v1~frontx.screensets.layout.screen.v1';
const TOKEN = /^[a-z][a-z0-9-]*$/;

type SeoBlock = { title?: string; description?: string; routes?: Record<string, unknown> };
type Extension = { id: string; domain: string; entry: string; route: string; presentation: { label: string; order: number; group?: string }; seo?: SeoBlock };

const extensions = manifest.extensions as Extension[];

/** Each exposed lifecycle module's route tree: `./lifecycle-<entry>` renders `routes-<entry>.tsx`. */
const ROUTE_TREE_OF_MODULE: Record<string, AnyRoute> = {
  './lifecycle-helloworld': helloworldRouteTree,
  './lifecycle-profile': profileRouteTree,
  './lifecycle-theme': themeRouteTree,
  './lifecycle-widgets-host': widgetsHostRouteTree,
};

/** The route tree a screen extension's entry renders. */
function routeTreeOf(extension: Extension): AnyRoute | undefined {
  const entry = manifest.entries.find((candidate) => candidate.id === extension.entry);
  return entry ? ROUTE_TREE_OF_MODULE[entry.exposedModule] : undefined;
}
const screens = extensions.filter((extension) => extension.domain === SCREEN_DOMAIN);

/** template-mfe's shared set plus the two routing packages, in this order, in every package of the site (the site's uniform screen package shape). */
const SHARED_DEPS = ['react', 'react-dom', '@gears-frontx/react', '@gears-frontx/framework', '@gears-frontx/state', '@gears-frontx/mfes', '@gears-frontx/gts-plugin', '@gears-frontx/api', '@gears-frontx/i18n', '@gears-frontx/routing', '@gears-frontx/routing-tanstack', '@tanstack/react-query', '@reduxjs/toolkit', 'react-redux'];

describe('demo-mfe mfe.json', () => {
  it('declares shared dependencies the template-mfe way: none in mfe.json, the shared set externalized in vite.config.ts', () => {
    expect(Object.keys(manifest.manifest).sort()).toEqual(['id', 'remoteEntry']);
    expect(JSON.stringify(manifest)).not.toMatch(/"shared"/);
    const declared = /const sharedDeps = \[([\s\S]*?)\];/.exec(viteConfig)?.[1] ?? '';
    expect(declared.match(/'[^']+'/g)?.map((name) => name.slice(1, -1))).toEqual(SHARED_DEPS);
    expect(viteConfig).toMatch(/shared: \{\},/);
    expect(viteConfig).toMatch(/external: sharedDeps,/);
  });

  it('carries GTS ids that parse, and entries that name this manifest', () => {
    for (const id of [manifest.manifest.id, ...manifest.entries.map((entry) => entry.id), ...extensions.map((extension) => extension.id), ...manifest.domains.map((domain) => domain.id)]) {
      expect(id).toMatch(GTS_ID);
    }
    for (const entry of manifest.entries) expect(entry.manifest).toBe(manifest.manifest.id);
  });

  it('exposes one ./lifecycle-<entry> module per entry', () => {
    expect(manifest.entries.map((entry) => entry.exposedModule).sort()).toEqual(
      ['./lifecycle-helloworld', './lifecycle-profile', './lifecycle-theme', './lifecycle-widgets-host'].sort()
    );
  });

  it('is product content, not a template example', () => {
    expect('templateExample' in manifest).toBe(false);
  });

  it('serves the remote from the port the package previews on', () => {
    const port = /--port (\d+)/.exec(pkg.scripts.preview)?.[1];
    expect(manifest.manifest.remoteEntry).toBe(`http://localhost:${port}/assets/remoteEntry.js`);
  });

  it('declares the four screens with mfe-* tokens and menu orders 65, 66, 67 and 69 in the demos group', () => {
    const byOrder = [...screens].sort((a, b) => a.presentation.order - b.presentation.order);
    expect(byOrder.map((screen) => [screen.route, screen.presentation.order, screen.presentation.label])).toEqual([
      ['/mfe-hello-world', 65, 'MFE mechanics: isolation'],
      ['/mfe-profile', 66, 'MFE mechanics: data loading'],
      ['/mfe-theme', 67, 'MFE mechanics: shared state'],
      ['/mfe-widgets', 69, 'MFE mechanics: nested widgets'],
    ]);
    for (const screen of screens) expect(screen.route.slice(1)).toMatch(TOKEN);
    for (const screen of screens) expect(screen.presentation.group).toBe(DEMOS_NAV_GROUP_ID);
  });

  it("declares every screen directly on the shell's screen extension type, under template-mfe's identifiers, and carries no screen type schema", () => {
    expect(screens.map((screen) => screen.id).sort()).toEqual([HELLOWORLD_EXTENSION_ID, PROFILE_EXTENSION_ID, THEME_EXTENSION_ID, WIDGETS_HOST_EXTENSION_ID].sort());
    for (const screen of screens) {
      expect(screen.id.startsWith(FRONTX_SCREEN_EXTENSION_TYPE), screen.id).toBe(true);
      expect(screen.id.slice(FRONTX_SCREEN_EXTENSION_TYPE.length), screen.id).not.toContain('~');
    }
    expect(manifest.schemas.filter((schema) => schema.$id.startsWith(`gts://${FRONTX_SCREEN_EXTENSION_TYPE}`))).toEqual([]);
  });

  it('registers every screen extension against the shell screen schema and the schemas it carries', () => {
    gtsPlugin.registerSchema(extensionScreenSchema);
    gtsPlugin.registerSchema(navGroupSchema);
    gtsPlugin.register({ id: DEMOS_NAV_GROUP_ID, name: 'demos' });
    for (const schema of manifest.schemas) gtsPlugin.registerSchema(schema as never);
    for (const screen of screens) expect(() => gtsPlugin.register(screen), screen.id).not.toThrow();
  });

  it('gives every screen page metadata covering its route tree', () => {
    for (const screen of screens) {
      expect(screen.seo?.title, screen.route).toBeTruthy();
      expect(screen.seo?.description?.length, screen.route).toBeGreaterThanOrEqual(50);
      expect(screen.seo?.description?.length, screen.route).toBeLessThanOrEqual(160);
      const routeTree = routeTreeOf(screen);
      expect(routeTree, screen.route).toBeDefined();
      const declared = ['/', ...Object.keys(screen.seo?.routes ?? {})];
      expect(declared.sort(), screen.route).toEqual(routeTreePaths(routeTree!));
    }
  });

  it('keeps the widgets domain routed under its own key', () => {
    expect(manifest.domains.map((domain) => domain.route)).toEqual(['widgets']);
  });
});
