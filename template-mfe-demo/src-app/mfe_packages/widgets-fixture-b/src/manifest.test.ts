import { describe, expect, it } from 'vitest';
import manifest from '../mfe.json';
import pkg from '../package.json';
import viteConfig from '../vite.config.ts?raw';

const WIDGETS_DOMAIN = 'gts.frontx.mfes.ext.domain.v1~frontx.widgets.area.main.v1';

/** template-mfe's shared set plus the two routing packages, in this order, in every package of the site (the site's uniform screen package shape). */
const SHARED_DEPS = ['react', 'react-dom', '@gears-frontx/react', '@gears-frontx/framework', '@gears-frontx/state', '@gears-frontx/mfes', '@gears-frontx/gts-plugin', '@gears-frontx/api', '@gears-frontx/i18n', '@gears-frontx/routing', '@gears-frontx/routing-tanstack', '@tanstack/react-query', '@reduxjs/toolkit', 'react-redux'];

describe('widgets-fixture-b mfe.json', () => {
  it('declares shared dependencies the template-mfe way: none in mfe.json, the shared set externalized in vite.config.ts', () => {
    expect(Object.keys(manifest.manifest).sort()).toEqual(['id', 'remoteEntry']);
    expect(JSON.stringify(manifest)).not.toMatch(/"shared"/);
    const declared = /const sharedDeps = \[([\s\S]*?)\];/.exec(viteConfig)?.[1] ?? '';
    expect(declared.match(/'[^']+'/g)?.map((name) => name.slice(1, -1))).toEqual(SHARED_DEPS);
    expect(viteConfig).toMatch(/shared: \{\},/);
    expect(viteConfig).toMatch(/external: sharedDeps,/);
  });

  it('is product content, not a template example', () => {
    expect('templateExample' in manifest).toBe(false);
  });

  it('serves the remote from the port the package previews on', () => {
    const port = /--port (\d+)/.exec(pkg.scripts.preview)?.[1];
    expect(manifest.manifest.remoteEntry).toBe(`http://localhost:${port}/assets/remoteEntry.js`);
  });

  it('contributes one widget to the widgets domain, and no page metadata (widgets are not pages)', () => {
    expect(manifest.extensions.map((extension) => [extension.route, extension.domain])).toEqual([['/widget-b', WIDGETS_DOMAIN]]);
    expect('seo' in (manifest.extensions[0] ?? {})).toBe(false);
  });
});
