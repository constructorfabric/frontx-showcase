// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { matchesPattern, resolvePage, routePathFromParam } from './page-map.ts';
import { buildPageMap } from './site.ts';
import { CONFIG, EXTENSIONS, MAP, ORIGIN } from './test-support/fixtures.ts';

describe('resolvePage', () => {
  it('gives the bare address of a sub-path mount the home page head, and any other bare path the fallback', () => {
    const map = buildPageMap(CONFIG, 'https://frontx.example/frontx', 'screen', EXTENSIONS);
    expect(resolvePage(map, { path: '/frontx/', search: '' })).toBe(map.home);
    expect(resolvePage(map, { path: '/', search: '' })).toBe(map.fallback);
    expect(resolvePage(map, { path: '/frontx/', search: 'screen=catalogue;route=components/button' }).title).toBe('Button');
  });

  it('finds a screen root and a route inside a screen', () => {
    expect(resolvePage(MAP, { path: '/', search: 'screen=home' })).toBe(MAP.home);
    expect(resolvePage(MAP, { path: '/', search: '?screen=catalogue;route=components/button' }).title).toBe('Button');
  });

  it('matches a pattern route, with the address itself as canonical', () => {
    const page = resolvePage(MAP, { path: '/', search: 'screen=inbox-contacts;route=r-42' });
    expect(page.title).toBe('Contact');
    expect(page.indexable).toBe(false);
    expect(page.canonical).toBe(`${ORIGIN}/?screen=inbox-contacts;route=r-42`);
  });

  it('builds a pattern page canonical from the screen entry and its route alone', () => {
    for (const search of ['widgets=widget-alpha&screen=inbox-contacts;route=r-42', 'screen=inbox-contacts;route=r-42;tab=notes&widgets=widget-alpha']) {
      const page = resolvePage(MAP, { path: '/', search });
      expect(page.title).toBe('Contact');
      expect(page.address).toBe('/?screen=inbox-contacts;route=r-42');
      expect(page.canonical).toBe(`${ORIGIN}/?screen=inbox-contacts;route=r-42`);
    }
  });

  it('resolves tokens and paths named like Object prototype keys to the fallback', () => {
    for (const search of ['screen=constructor', 'screen=toString', 'screen=__proto__', 'screen=hasOwnProperty;route=x']) {
      expect(resolvePage(MAP, { path: '/', search })).toBe(MAP.fallback);
    }
  });

  it('falls back to the site head, not indexable, for an address that names no page', () => {
    for (const search of ['screen=nowhere', 'screen=catalogue;route=components/nowhere', 'widgets=widget-alpha']) {
      expect(resolvePage(MAP, { path: '/', search })).toBe(MAP.fallback);
    }
    expect(resolvePage(MAP, { path: '/components/button', search: '' })).toBe(MAP.fallback);
    expect(MAP.fallback.indexable).toBe(false);
  });

  it('resolves the bare shell root, where the shell opens the home screen, to the home page', () => {
    expect(resolvePage(MAP, { path: '/', search: '' })).toBe(MAP.home);
    expect(resolvePage(MAP, { path: '/', search: '?' })).toBe(MAP.home);
  });

  it('reads the screen entry among other domains entries', () => {
    expect(resolvePage(MAP, { path: '/', search: 'screen=catalogue;route=components/card&widgets=widget-alpha' }).title).toBe('Card');
  });
});

describe('route paths', () => {
  it('turn a route parameter into the virtual path', () => {
    expect(routePathFromParam(undefined)).toBe('/');
    expect(routePathFromParam('')).toBe('/');
    expect(routePathFromParam('components/button')).toBe('/components/button');
    expect(routePathFromParam('/week/')).toBe('/week');
  });

  it('match a pattern segment by segment', () => {
    expect(matchesPattern('/$contactId', '/r-1')).toBe(true);
    expect(matchesPattern('/$contactId', '/')).toBe(false);
    expect(matchesPattern('/$contactId', '/r-1/notes')).toBe(false);
    expect(matchesPattern('/people/$id', '/people/7')).toBe(true);
  });
});
