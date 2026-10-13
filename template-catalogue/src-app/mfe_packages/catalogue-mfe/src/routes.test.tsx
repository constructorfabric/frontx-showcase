import { screen, waitFor, within } from '@testing-library/react';
import { resolveNavigationHistory } from '@gears-frontx/routing';
import { adaptProviderHistory, createRouter } from '@gears-frontx/routing-tanstack';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CATALOGUE_PATHS, COMPONENTS, FAMILIES, FOUNDATIONS } from './catalog';
import { catalogueRouteTree } from './routes';
import { renderCatalogueAt } from './test-support/renderCatalogueAt';
import en from './screens/catalogue/i18n/en.json';

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('catalogue pages', () => {
  it('are the index, one page per example file and one per foundation, each path once', () => {
    expect(CATALOGUE_PATHS).toEqual(['/', ...FOUNDATIONS.map((entry) => entry.path), ...COMPONENTS.map((entry) => entry.path)]);
    expect(new Set(CATALOGUE_PATHS).size).toBe(CATALOGUE_PATHS.length);
    expect(COMPONENTS.every((entry) => entry.path === `/components/${entry.slug}`)).toBe(true);
    expect(FOUNDATIONS.every((entry) => entry.path === `/foundations/${entry.slug}`)).toBe(true);
  });
});

describe('catalogueRouteTree', () => {
  const router = createRouter({ routeTree: catalogueRouteTree, history: adaptProviderHistory(resolveNavigationHistory(), undefined) });

  it.each(CATALOGUE_PATHS)('resolves %s to a page route with its own parameters', (path) => {
    const matches = router.matchRoutes(path, {});
    const leaf = matches[matches.length - 1];
    const expected = path === '/' ? path : path.startsWith('/components/') ? '/components/$slug' : '/foundations/$slug';
    expect(leaf?.routeId).toBe(expected);
    if (expected.includes('$slug')) expect((leaf?.params as { slug?: string }).slug).toBe(path.split('/').pop());
  });

  it("renders the catalogue's not-found page for an unknown slug and for an unknown path", async () => {
    renderCatalogueAt('/components/no-such-component');
    expect(await screen.findByRole('heading', { level: 1, name: en.not_found_title })).toBeTruthy();
  });

  it('renders the not-found page for a path outside the tree', async () => {
    renderCatalogueAt('/elsewhere/entirely');
    expect(await screen.findByTestId('catalogue-not-found')).toBeTruthy();
  });

  it('renders the index with one level-one heading and a link to every component page', async () => {
    renderCatalogueAt('/');
    const main = await screen.findByTestId('catalogue-page');
    expect(await within(main).findByRole('heading', { level: 1, name: en.title })).toBeTruthy();
    expect(within(main).getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const hrefs = within(main)
      .getAllByRole('link')
      .filter((link) => link.hasAttribute('href'))
      .map((link) => link.getAttribute('href'));
    // The breadcrumb's root crumb, then every component page; the foundations live under their own tab. The kit's current crumb is a link role without an address.
    expect(hrefs.sort()).toEqual(['/', ...COMPONENTS.map((entry) => entry.path)].sort());
  });

  it('lists the families on the index and in the navigation panel in the same order, after the panel section groups', async () => {
    renderCatalogueAt('/');
    const main = await screen.findByTestId('catalogue-page');
    const nav = await screen.findByRole('navigation', { name: en.nav_label });
    const familyNames = FAMILIES.map((family) => en[`family.${family}` as keyof typeof en]);
    expect(within(main).getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(familyNames);
    expect(within(nav).getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([en.components, en.foundations, ...familyNames]);
  });

  // A navigation group named like an index section would be a second landmark with the same name.
  it('names each region landmark of the index once', async () => {
    renderCatalogueAt('/');
    await screen.findByRole('heading', { level: 1, name: en.title });
    const names = screen.getAllByRole('region').map((region) => region.getAttribute('aria-label') ?? region.getAttribute('aria-labelledby'));
    expect(new Set(names).size).toBe(names.length);
    expect(screen.getAllByRole('group', { name: en.foundations })).toHaveLength(1);
  });

  it('underlines the section of the current page in the tab bar', async () => {
    renderCatalogueAt('/components/button');
    const tabs = await screen.findByRole('navigation', { name: en.sections_label });
    expect(within(tabs).getByTestId('section-components').getAttribute('aria-current')).toBe('true');
    expect(within(tabs).getByTestId('section-foundations').getAttribute('href')).toBe(FOUNDATIONS[0]?.path);
    // The bar lists the catalogue's own two sections and nothing else.
    expect(within(tabs).getAllByRole('link').map((link) => link.getAttribute('data-testid'))).toEqual(['section-components', 'section-foundations']);
  });

  // At 1440x900 the sticky panel starts under the tab bar and runs past the viewport until the page scrolls, so the Input row sat in the panel but under the viewport's edge: `scrollIntoView` then scrolled the whole page by 27px on load.
  it.each([
    ['a row under the viewport edge', 880, 16],
    ['a row already in sight', 400, 0],
  ])('keeps %s in sight by scrolling the panel only, never the page', async (_case, rowTop, expectedScroll) => {
    const viewport = window.innerHeight;
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 });
    const intoView = vi.spyOn(Element.prototype, 'scrollIntoView');
    const rects = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      const nav = this.closest('[data-testid="catalogue-nav"]');
      if (this === nav) return DOMRect.fromRect({ x: 0, y: 119, width: 260, height: 900 });
      if (nav && this.getAttribute('aria-current') === 'page') return DOMRect.fromRect({ x: 18, y: rowTop - nav.scrollTop, width: 224, height: 36 });
      return DOMRect.fromRect();
    });
    try {
      renderCatalogueAt('/components/input');
      const nav = await screen.findByTestId('catalogue-nav');
      await waitFor(() => expect(within(nav).getByRole('link', { current: 'page' }).textContent).toBe('Input'));
      await waitFor(() => expect(nav.scrollTop).toBe(expectedScroll));
      // scrollIntoView is what moved the page: it scrolls every scrolling ancestor. (The router's own scroll restoration calls window.scrollTo, so that is not the signal.)
      expect(intoView).not.toHaveBeenCalled();
    } finally {
      rects.mockRestore();
      intoView.mockRestore();
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: viewport });
    }
  });

  it('marks the current page in the navigation panel and keeps the section row current on a component page', async () => {
    renderCatalogueAt('/components/button');
    const nav = await screen.findByRole('navigation', { name: en.nav_label });
    const current = within(nav).getByRole('link', { current: 'page' });
    expect(current.textContent).toBe('Button');
    expect(current.getAttribute('href')).toBe('/components/button');
    expect(within(nav).getByTestId('nav-all-components').hasAttribute('data-section-current')).toBe(true);
  });

  it.each([
    ['/', 'nav-all-components'],
    [FOUNDATIONS[0]!.path, `nav-${FOUNDATIONS[0]!.slug}`],
  ])('fills exactly one panel row, the section row of %s', async (path, testId) => {
    renderCatalogueAt(path);
    const nav = await screen.findByRole('navigation', { name: en.nav_label });
    const filled = Array.from(nav.querySelectorAll('[data-section-current]'));
    expect(filled.map((row) => row.getAttribute('data-testid'))).toEqual([testId]);
    expect(filled[0]?.getAttribute('aria-current')).toBe('page');
  });
});
