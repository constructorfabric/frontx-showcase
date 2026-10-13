// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderIndexHtml, renderLlms, renderRobots, renderSeoManifest, renderSitemap, renderWebManifest } from './outputs.ts';
import { buildPageMap } from './site.ts';
import { CONFIG, EXTENSIONS, MAP, ORIGIN } from './test-support/fixtures.ts';

const PACKAGES = [{ name: '@gears-frontx/ui-kit@0.4.0', url: 'https://unpkg.com/@gears-frontx/ui-kit@0.4.0/llms.txt', description: 'The UI kit.' }];

const SHELL_INDEX = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>FrontX</title>
    <script type="module" crossorigin src="/assets/index.js"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

describe('generated outputs', () => {
  it('sitemap.xml lists every indexable page, no pattern route', () => {
    expect(renderSitemap(MAP)).toMatchSnapshot();
    expect(renderSitemap(MAP).match(/<loc>/g)).toHaveLength(6);
  });

  it('llms.txt has a section per screen in menu order, routes grouped by their first segment, and the package links', () => {
    expect(renderLlms(MAP, CONFIG.defaultDescription, PACKAGES)).toMatchSnapshot();
  });

  it('robots.txt points at the sitemap on the origin', () => {
    expect(renderRobots(MAP)).toBe(`User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);
  });

  it('seo-manifest.json keys pages by canonical URL and lists pattern routes apart', () => {
    const manifest = JSON.parse(renderSeoManifest(MAP));
    expect(Object.keys(manifest.pages)).toHaveLength(6);
    expect(manifest.pages[`${ORIGIN}/?screen=catalogue;route=components/button`].documentTitle).toBe('Button - FrontX');
    // The manifest's og.title must match what head-sync writes into og:title: the document title, the site name on home.
    expect(manifest.pages[`${ORIGIN}/?screen=catalogue;route=components/button`].og.title).toBe('Button - FrontX');
    expect(manifest.pages[MAP.home.canonical].og.title).toBe(MAP.siteName);
    expect(manifest.patterns).toEqual([expect.objectContaining({ addressPattern: '/?screen=inbox-contacts;route=$contactId', indexable: false })]);
  });

  it('index.html gets the site-level head, the page map and the script once, however often it is generated', () => {
    const once = renderIndexHtml(SHELL_INDEX, MAP, 'console.log("head-sync")');
    expect(renderIndexHtml(once, MAP, 'console.log("head-sync")')).toBe(once);
    expect(once.match(/site-meta:start/g)).toHaveLength(1);
    expect(once).toContain(`<link rel="canonical" href="${ORIGIN}/?screen=home" />`);
    expect(once).toContain('<meta name="description" content="FrontX is a framework');
    expect(once.indexOf('site-meta-map')).toBeLessThan(once.indexOf('/assets/index.js'));
  });

  it('index.html never lets inlined text close its script element, and keeps the script valid', () => {
    const html = renderIndexHtml(SHELL_INDEX, MAP, 'var less = 1 < 2; var s = "</script><script>alert(1)</script>";');
    expect(html.match(/<\/script>/g)).toHaveLength(3);
    const inlined = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1] ?? '';
    expect(() => new Function(inlined)).not.toThrow();
    const json = /<script type="application\/json" id="site-meta-map">([\s\S]*?)<\/script>/.exec(html)?.[1] ?? '';
    expect(JSON.parse(json)).toEqual(JSON.parse(JSON.stringify(MAP)));
  });
});

describe('share image, theme color and web manifest', () => {
  const config = { ...CONFIG, ogImage: '/og-image.png', ogImageAlt: 'FrontX: a shell hosting two screens', themeColor: '#0065e3', backgroundColor: '#f1f5f9', twitterCard: 'summary_large_image' };
  const map = buildPageMap(config, ORIGIN, 'screen', EXTENSIONS);

  it('resolves a share image path on the origin and gives it its alternative text in the head', () => {
    const html = renderIndexHtml('<html><head><title>x</title></head><body></body></html>', map, '');
    expect(html).toContain(`<meta property="og:image" content="${ORIGIN}/og-image.png" />`);
    expect(html).toContain('<meta property="og:image:alt" content="FrontX: a shell hosting two screens" />');
    expect(html).toContain('<meta name="twitter:image:alt" content="FrontX: a shell hosting two screens" />');
    expect(html).toContain('<meta name="theme-color" content="#0065e3" />');
    expect(html).toContain('<link rel="manifest" href="site.webmanifest" />');
  });

  it('links the icons and the web manifest relative to the document, so the head works at any mount point', () => {
    const html = renderIndexHtml('<html><head><title>x</title></head><body></body></html>', map, '');
    const hrefs = [...html.matchAll(/<link rel="(?:icon|apple-touch-icon|manifest)"[^>]*href="([^"]*)"/g)].map((match) => match[1]);
    expect(hrefs).toEqual(['brand/favicon.ico', 'brand/favicon-32.png', 'brand/apple-touch-icon.png', 'site.webmanifest']);
  });

  it('writes a web manifest that starts at the home page with the site colors and icons', () => {
    const manifest = JSON.parse(renderWebManifest(map, config));
    expect(manifest).toMatchObject({ name: 'FrontX', start_url: `.${map.home.address}`, theme_color: '#0065e3', background_color: '#f1f5f9' });
    // Relative to the manifest, which the build ships next to the document: the home page and the icons resolve under any mount point.
    expect(new URL(manifest.start_url, 'https://frontx.example/frontx/site.webmanifest').href).toBe('https://frontx.example/frontx/?screen=home');
    expect(manifest.icons.map((icon: { src: string }) => icon.src)).toEqual(['brand/icon-192.png', 'brand/icon-512.png', 'brand/icon-maskable-512.png']);
    expect(manifest.icons.map((icon: { sizes: string; purpose?: string }) => `${icon.sizes}${icon.purpose ? ` ${icon.purpose}` : ''}`)).toEqual(['192x192', '512x512', '512x512 maskable']);
    expect(manifest.short_name).toBe('FrontX');
    expect(JSON.parse(renderWebManifest(map, { ...config, shortName: 'FX' })).short_name).toBe('FX');
  });
});
