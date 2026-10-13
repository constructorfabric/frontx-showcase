import { describe, expect, it } from 'vitest';
import { buildNavigation as buildNavigationWith, documentHref, homeScreen, isPlainClick, screenHref, withoutGroups, type NavigableScreen } from './navigation';

const SCREEN_TYPE = 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~';

/** The id of a nav group instance the host defines, by its name. */
const groupId = (name: string) => `gts.frontx.screensets.layout.nav_group.v1~fixture.site.layout.${name}.v1`;

/** The groups the host defines in these cases. */
const GROUPS: ReadonlyMap<string, string> = new Map(['demos', 'guides'].map((name) => [groupId(name), name]));

/** A screen extension; one with a group names the group's instance id, as its package declares it. */
const screen = (name: string, route: string, order: number, group?: string): NavigableScreen => ({
  id: `${SCREEN_TYPE}${name}`,
  route,
  presentation: { label: name, order, ...(group ? { group: groupId(group) } : {}) },
});

const buildNavigation = (screens: readonly NavigableScreen[], domainKey: string, activeName: string | undefined) =>
  buildNavigationWith(screens, domainKey, screens.find((candidate) => candidate.presentation.label === activeName)?.id, GROUPS);

/** An entry's name in the assertions: the screen's label, or `group:<token>`. */
const nameOf = (entry: ReturnType<typeof buildNavigation>[number]) => (entry.kind === 'screen' ? entry.label : `group:${entry.id}`);

describe('screenHref', () => {
  it('writes a screen root in the routing grammar', () => {
    expect(screenHref('screen', '/home')).toBe('./?screen=home');
  });

  it('has no address for a route the grammar cannot carry', () => {
    expect(screenHref('screen', '/Not A Token')).toBeUndefined();
  });

  it('resolves next to the shell document wherever the site is mounted, at an origin root or under a sub-path', () => {
    const href = screenHref('screen', '/docs') ?? '';
    expect(new URL(href, 'https://example.invalid/?screen=home').href).toBe('https://example.invalid/?screen=docs');
    expect(new URL(href, 'https://example.invalid/frontx/?screen=home').href).toBe('https://example.invalid/frontx/?screen=docs');
    expect(new URL(href, 'https://example.invalid/frontx/index.html').href).toBe('https://example.invalid/frontx/?screen=docs');
  });
});

describe('documentHref', () => {
  it('writes a site-root path relative to the shell document', () => {
    expect(documentHref('/')).toBe('./');
    expect(documentHref('/?screen=docs')).toBe('./?screen=docs');
    expect(new URL(documentHref('/'), 'https://example.invalid/frontx/?screen=docs').href).toBe('https://example.invalid/frontx/');
  });

  it('refuses a path that is not site-root', () => {
    expect(() => documentHref('docs')).toThrow(/site-root path/);
  });
});

describe('buildNavigation', () => {
  it('lists ungrouped screens in order and folds a group into one entry at its first member', () => {
    const entries = buildNavigation(
      [screen('docs', '/docs', 40), screen('mail', '/mail', 72, 'demos'), screen('home', '/home', 10), screen('calendar', '/calendar', 60, 'demos'), screen('kit', '/kit', 30)],
      'screen',
      'mail'
    );
    expect(entries.map(nameOf)).toEqual(['home', 'kit', 'docs', 'group:demos']);
    const group = entries[3];
    expect(group?.kind === 'group' && group.items.map((item) => item.label)).toEqual(['calendar', 'mail']);
    expect(group?.kind === 'group' && group.active).toBe(true);
    expect(group?.kind === 'group' && group.order).toBe(60);
  });

  it('marks the mounted screen active and links every screen by its canonical address', () => {
    const [home] = buildNavigation([screen('home', '/home', 10)], 'screen', 'home');
    expect(home).toMatchObject({ kind: 'screen', active: true, href: './?screen=home' });
  });

  it('leaves out a screen the grammar cannot address', () => {
    expect(buildNavigation([screen('bad', '/Bad Token', 1), screen('good', '/good', 2)], 'screen', undefined).map(nameOf)).toEqual(['good']);
  });

  it('carries the route token of each screen, the name the site config uses', () => {
    const [home] = buildNavigation([screen('ext.home-screen', '/home', 10)], 'screen', undefined);
    expect(home).toMatchObject({ id: `${SCREEN_TYPE}ext.home-screen`, token: 'home' });
  });

  it('reads a group only when the host defines it', () => {
    const stray: NavigableScreen = { id: `${SCREEN_TYPE}stray`, route: '/stray', presentation: { label: 'stray', order: 5, group: groupId('unknown') } };
    const token: NavigableScreen = { id: `${SCREEN_TYPE}token`, route: '/token', presentation: { label: 'token', order: 6, group: 'demos' } };
    const entries = buildNavigation([stray, token, screen('mail', '/mail', 61, 'demos')], 'screen', undefined);
    expect(entries.map(nameOf)).toEqual(['stray', 'token', 'group:demos']);
    expect(entries[2]?.kind === 'group' && entries[2].items.map((item) => item.label)).toEqual(['mail']);
  });
});

describe('homeScreen', () => {
  const entries = buildNavigation([screen('ext.demo', '/demo', 1, 'demos'), screen('ext.about', '/about', 2), screen('ext.home', '/home', 10), screen('ext.kit', '/kit', 30)], 'screen', undefined);

  it('is the screen the configured token names, not the lowest order', () => {
    expect(homeScreen(entries, 'home')?.label).toBe('ext.home');
    expect(homeScreen(entries, 'kit')?.label).toBe('ext.kit');
  });

  it('finds the configured screen inside a group too', () => {
    expect(homeScreen(entries, 'demo')?.label).toBe('ext.demo');
  });

  it('has no home when the token names no registered screen, instead of guessing one', () => {
    expect(homeScreen(entries, 'missing')).toBeUndefined();
  });
});

describe('isPlainClick', () => {
  const click = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false };
  it('handles a plain primary click and leaves modified or secondary clicks to the browser', () => {
    expect(isPlainClick(click)).toBe(true);
    expect(isPlainClick({ ...click, metaKey: true })).toBe(false);
    expect(isPlainClick({ ...click, button: 1 })).toBe(false);
    expect(isPlainClick({ ...click, defaultPrevented: true })).toBe(false);
  });
});

describe('withoutGroups', () => {
  it('drops the named groups and keeps every top-level screen and every other group', () => {
    const entries = buildNavigation(
      [screen('home', '/home', 10), screen('mail', '/mail', 61, 'demos'), screen('libs', '/libs', 35), screen('guide', '/guide', 70, 'guides')],
      'screen',
      'mail'
    );
    expect(withoutGroups(entries, ['demos']).map(nameOf)).toEqual(['home', 'libs', 'group:guides']);
  });
});
