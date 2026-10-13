import { screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { COMPONENTS, FOUNDATIONS } from './catalog';
import en from './screens/catalogue/i18n/en.json';
import { renderCatalogueAt } from './test-support/renderCatalogueAt';

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

/**
 * Every page of the catalogue rendered at its own route: the page's title is the one level-one heading of the content, its module loads (the lazy example import resolves) and nothing reaches the page's error boundary. jsdom renders no layout, so this checks loading and rendering, not appearance.
 */
describe('every catalogue page', () => {
  const strings: Record<string, string> = en;
  const pages = [...FOUNDATIONS, ...COMPONENTS].map((entry) => [entry.path, strings[entry.labelKey] ?? entry.labelKey] as const);

  it.each(pages)('%s renders its page without an error boundary', async (path, label) => {
    renderCatalogueAt(path);
    const main = await screen.findByTestId('catalogue-page');
    expect(await within(main).findByRole('heading', { level: 1, name: label })).toBeTruthy();
    await waitFor(() => expect(main.querySelector('[aria-label="Loading the page"]')).toBeNull(), { timeout: 10000 });
    expect(within(main).queryByTestId('example-error')).toBeNull();
    expect(main.querySelector('[data-testid="catalogue-not-found"]')).toBeNull();
    // The page's title names the page once: no section heading below repeats it.
    expect(within(main).getAllByRole('heading', { name: label })).toHaveLength(1);
  });
});
