// @vitest-environment node
import { serializeGrammar, type DomainKey, type ExtensionToken } from '@gears-frontx/routing';
import { describe, expect, it } from 'vitest';
import { addressOf, buildPageMap, MISSING_ORIGIN_MESSAGE, resolveOrigin, staticPages, type ScreenExtension } from './site.ts';
import { CONFIG, EXTENSIONS, MAP, ORIGIN } from './test-support/fixtures.ts';

describe('canonical addresses', () => {
  it('are exactly what serializeGrammar writes, the function the framework router writes the URL with', () => {
    const cases: Array<[string, string]> = [
      ['home', '/'],
      ['catalogue', '/components/button'],
      ['calendar', '/suite'],
      ['inbox-contacts', '/r-42'],
      ['catalogue', '/a b/c;d=e'],
    ];
    for (const [token, route] of cases) {
      const value = route.replace(/^\//, '');
      const expected = serializeGrammar({
        shellSubroute: '/',
        hash: undefined,
        entries: [{ domainKey: 'screen' as DomainKey, extension: token as ExtensionToken, params: value === '' ? [] : [{ name: 'route', value }] }],
      });
      expect(addressOf('screen', token, route)).toBe(expected);
    }
    expect(addressOf('screen', 'catalogue', '/components/button')).toBe('/?screen=catalogue;route=components/button');
    expect(addressOf('screen', 'home', '/')).toBe('/?screen=home');
  });

  it('put every page of the map on the origin', () => {
    expect(staticPages(MAP).map((page) => page.canonical)).toEqual([
      `${ORIGIN}/?screen=home`,
      `${ORIGIN}/?screen=catalogue`,
      `${ORIGIN}/?screen=catalogue;route=components/button`,
      `${ORIGIN}/?screen=catalogue;route=components/card`,
      `${ORIGIN}/?screen=catalogue;route=foundations/typography`,
      `${ORIGIN}/?screen=inbox-contacts`,
    ]);
  });
});

describe('resolveOrigin', () => {
  it('fails without an origin, naming site.config.json.origin', () => {
    expect(() => resolveOrigin(CONFIG, {})).toThrow(MISSING_ORIGIN_MESSAGE);
    expect(MISSING_ORIGIN_MESSAGE).toContain('site.config.json.origin');
  });

  it('takes SITE_ORIGIN over the configured origin, and normalizes it', () => {
    expect(resolveOrigin({ ...CONFIG, origin: 'https://frontx.example' }, {})).toBe('https://frontx.example');
    expect(resolveOrigin({ ...CONFIG, origin: 'https://frontx.example' }, { SITE_ORIGIN: 'http://localhost:4173/' })).toBe('http://localhost:4173');
  });

  it('keeps the sub-path the site is mounted at, without its trailing slash', () => {
    expect(resolveOrigin(CONFIG, { SITE_ORIGIN: 'https://frontx.example/frontx/' })).toBe('https://frontx.example/frontx');
    expect(resolveOrigin({ ...CONFIG, origin: 'https://frontx.example/a/b' }, {})).toBe('https://frontx.example/a/b');
  });

  it('refuses a query, a hash, or an address that is not http', () => {
    expect(() => resolveOrigin(CONFIG, { SITE_ORIGIN: 'https://frontx.example/?x=1' })).toThrow(/no query or hash/);
    expect(() => resolveOrigin(CONFIG, { SITE_ORIGIN: 'https://frontx.example/#top' })).toThrow(/no query or hash/);
    expect(() => resolveOrigin(CONFIG, { SITE_ORIGIN: 'ftp://frontx.example' })).toThrow(/http or https/);
  });
});

describe('buildPageMap under a sub-path', () => {
  const SUB = 'https://frontx.example/frontx';
  const map = buildPageMap({ ...CONFIG, ogImage: '/og-image.png', ogImageAlt: 'FrontX' }, SUB, 'screen', EXTENSIONS);

  it('writes every canonical address under the sub-path', () => {
    expect(map.home.canonical).toBe(`${SUB}/?screen=home`);
    for (const page of staticPages(map)) expect(page.canonical.startsWith(`${SUB}/?`)).toBe(true);
  });

  it('resolves a share image path under the sub-path, where the build ships it', () => {
    expect(map.ogImage).toBe(`${SUB}/og-image.png`);
  });
});

describe('buildPageMap', () => {
  it('titles the home page with the site name and every other page with the title template', () => {
    expect(MAP.home.documentTitle).toBe('FrontX');
    expect(MAP.screens.catalogue?.pages['/components/button']?.documentTitle).toBe('Button - FrontX');
    expect(MAP.screens.catalogue?.pages['/']?.documentTitle).toBe('UI Kit - FrontX');
  });

  it('keeps pattern routes apart and not indexable', () => {
    const contacts = MAP.screens['inbox-contacts'];
    expect(Object.keys(contacts?.pages ?? {})).toEqual(['/']);
    expect(contacts?.patterns.map((page) => [page.route, page.indexable])).toEqual([['/$contactId', false]]);
  });

  it('refuses two screen extensions with one token, naming both packages', () => {
    const [catalogue] = EXTENSIONS as [ScreenExtension];
    const twin: ScreenExtension = { ...catalogue, id: 'ext.catalogue-twin', packageName: 'catalogue-twin-mfe', seo: { title: 'Twin', description: 'A second catalogue that would silently replace the first one.' } };
    expect(() => buildPageMap(CONFIG, ORIGIN, 'screen', [...EXTENSIONS, twin])).toThrow('screen token "catalogue" is declared by more than one screen extension (catalogue-mfe, catalogue-twin-mfe)');
  });

  it('refuses a home screen named like an Object prototype key', () => {
    expect(() => buildPageMap({ ...CONFIG, homeScreen: 'constructor' }, ORIGIN, 'screen', EXTENSIONS)).toThrow(/homeScreen "constructor"/);
  });

  it('refuses a home screen the site does not have', () => {
    expect(() => buildPageMap({ ...CONFIG, homeScreen: 'start' }, ORIGIN, 'screen', EXTENSIONS)).toThrow(/homeScreen "start"/);
  });
});
