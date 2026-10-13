// @vitest-environment jsdom
import { resolveNavigationHistory } from '@gears-frontx/routing';
import { afterEach, describe, expect, it } from 'vitest';
import { applyHead, startHeadSync } from './head-sync.ts';
import { MAP, ORIGIN } from './test-support/fixtures.ts';

const head = (selector: string, attribute: string) => document.head.querySelector(selector)?.getAttribute(attribute);

afterEach(() => {
  document.head.replaceChildren();
  document.title = '';
});

describe('head-sync', () => {
  it('sets the head of the current page, then follows a push to another page', () => {
    window.history.replaceState(null, '', '/?screen=home');
    const release = startHeadSync(window, MAP);
    expect(document.title).toBe('FrontX');
    expect(head('link[rel="canonical"]', 'href')).toBe(`${ORIGIN}/?screen=home`);
    // A share shows the document title: the site name on the home page, the title template on any other.
    expect(MAP.home.title).not.toBe(MAP.siteName);
    expect(head('meta[property="og:title"]', 'content')).toBe(MAP.siteName);
    expect(head('meta[name="twitter:title"]', 'content')).toBe(MAP.siteName);

    resolveNavigationHistory().push('/?screen=catalogue;route=components/button');

    expect(document.title).toBe('Button - FrontX');
    expect(head('link[rel="canonical"]', 'href')).toBe(`${ORIGIN}/?screen=catalogue;route=components/button`);
    expect(head('meta[name="description"]', 'content')).toBe(MAP.screens.catalogue?.pages['/components/button']?.description);
    expect(head('meta[name="robots"]', 'content')).toBe('index, follow');
    expect(head('meta[property="og:title"]', 'content')).toBe('Button - FrontX');
    expect(head('meta[name="twitter:title"]', 'content')).toBe('Button - FrontX');
    expect(head('meta[property="og:url"]', 'content')).toBe(`${ORIGIN}/?screen=catalogue;route=components/button`);
    expect(window.location.search).toBe('?screen=catalogue;route=components/button');
    release();
  });

  it('marks a page that is not indexable, and an address that names no page', () => {
    window.history.replaceState(null, '', '/?screen=inbox-contacts;route=r-7');
    const release = startHeadSync(window, MAP);
    expect(document.title).toBe('Contact - FrontX');
    expect(head('meta[name="robots"]', 'content')).toBe('noindex, follow');

    resolveNavigationHistory().push('/components/button');
    expect(document.title).toBe('FrontX');
    expect(head('link[rel="canonical"]', 'href')).toBe(`${ORIGIN}/?screen=home`);
    expect(head('meta[name="robots"]', 'content')).toBe('noindex, follow');
    release();
  });

  it('writes the home page head at the bare shell root and never touches the address', () => {
    window.history.replaceState(null, '', '/');
    const release = startHeadSync(window, MAP);
    expect(document.title).toBe(MAP.home.documentTitle);
    expect(head('link[rel="canonical"]', 'href')).toBe(`${ORIGIN}/?screen=home`);
    expect(head('meta[name="robots"]', 'content')).toBe('index, follow');
    expect(window.location.pathname + window.location.search).toBe('/');

    // The shell's `mount_ext` with the replace intent then writes the home screen's entry; the head stays the home page's.
    resolveNavigationHistory().replace('/?screen=home');
    expect(head('link[rel="canonical"]', 'href')).toBe(`${ORIGIN}/?screen=home`);
    release();
  });

  it('updates the static head in place instead of adding a second set', () => {
    document.head.innerHTML = '<meta name="description" content="site" /><link rel="canonical" href="x" />';
    applyHead(document, MAP, MAP.home);
    applyHead(document, MAP, MAP.home);
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.head.querySelector('meta[property="og:image"]')).toBeNull();
  });
});
