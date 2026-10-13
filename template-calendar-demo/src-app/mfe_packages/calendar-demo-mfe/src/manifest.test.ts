import { describe, expect, it } from 'vitest';
import manifest from '../mfe.json';
import pkg from '../package.json';
import viteConfig from '../vite.config.ts?raw';
import { calendarRouteTree } from './routes';
import { routeTreePaths } from './test-support/routeTreePaths';
import en from './screens/calendar/i18n/en.json';

const GTS_ID = /^gts(\.[a-z][a-z0-9_]*){4}\.v\d+(~[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){3}\.v\d+)*~?$/;
const SCREEN_DOMAIN = 'gts.frontx.mfes.ext.domain.v1~frontx.screensets.layout.screen.v1';
const TOKEN = /^[a-z][a-z0-9-]*$/;
/** The shell's screen extension type. */
const SCREEN_TYPE = 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~';
/** The site host's demos navigation group, an instance of the shell's nav group type. */
const DEMOS_GROUP = 'gts.frontx.screensets.layout.nav_group.v1~frontx.site.layout.demos.v1';

type RouteSeo = { title?: string; description?: string; indexable?: boolean };
type Extension = { id: string; domain: string; route: string; presentation: unknown; seo: RouteSeo & { routes?: Record<string, RouteSeo> } };

const [calendar] = manifest.extensions as Extension[];

/** template-mfe's shared set plus the two routing packages, in this order, in every package of the site (the site's uniform screen package shape). */
const SHARED_DEPS = ['react', 'react-dom', '@gears-frontx/react', '@gears-frontx/framework', '@gears-frontx/state', '@gears-frontx/mfes', '@gears-frontx/gts-plugin', '@gears-frontx/api', '@gears-frontx/i18n', '@gears-frontx/routing', '@gears-frontx/routing-tanstack', '@tanstack/react-query', '@reduxjs/toolkit', 'react-redux'];

describe('calendar-demo-mfe mfe.json', () => {
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

  it("declares the calendar screen: token, menu entry and the host's demos group", () => {
    expect(manifest.extensions).toHaveLength(1);
    expect(calendar?.domain).toBe(SCREEN_DOMAIN);
    expect(calendar?.route).toBe('/calendar');
    expect(calendar?.route.slice(1)).toMatch(TOKEN);
    expect(calendar?.presentation).toEqual({ label: 'Calendar: coming soon', icon: 'lucide:calendar', order: 60, group: DEMOS_GROUP });
  });

  it("declares the screen directly on the shell's screen extension type and carries no schema of its own", () => {
    expect(calendar?.id).toBe(`${SCREEN_TYPE}frontx.calendar_demo.screens.calendar.v1`);
    expect('schemas' in manifest).toBe(false);
  });

  it('declares metadata for its one page and keeps it out of the index: the screen has no inner routes', () => {
    expect(routeTreePaths(calendarRouteTree)).toEqual(['/']);
    expect(calendar?.seo.routes).toBeUndefined();
    expect(calendar?.seo.indexable).toBe(false);
  });

  it('titles the page with its heading text and describes it in 50 to 160 characters', () => {
    expect(calendar?.seo.title).toBe(en.placeholder_title);
    expect(calendar?.seo.description?.length).toBeGreaterThanOrEqual(50);
    expect(calendar?.seo.description?.length).toBeLessThanOrEqual(160);
  });
});
