import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import versions from './data/versions.generated.json';
import en from './screens/docs/i18n/en.json';
import { renderDocsAt } from './test-support/renderAt';

vi.mock('@gears-frontx/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@gears-frontx/react')>();
  return {
    ...actual,
    apiRegistry: { getService: () => ({ getVersions: {} }) },
    useApiQuery: () => ({ data: versions, isLoading: false, isError: false }),
  };
});

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('[]')));
  // The router restores scroll on navigation; jsdom does not implement scrolling.
  vi.stubGlobal('scrollTo', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState(null, '', '/');
});

describe('docsRouteTree', () => {
  it.each([
    ['/', 'overview.title'],
    ['/get-started', 'start.title'],
    ['/first-change', 'change.title'],
  ] as const)('renders the page at %s', async (path, titleKey) => {
    renderDocsAt(path);
    expect(await screen.findByRole('heading', { level: 1, name: en[titleKey] })).toBeTruthy();
  });

  it.each(['/nowhere', '/libraries'])("renders the screen's own not-found page for %s, which is no docs page", async (path) => {
    renderDocsAt(path);
    expect(await screen.findByRole('heading', { level: 1, name: en.not_found_title })).toBeTruthy();
  });
});
