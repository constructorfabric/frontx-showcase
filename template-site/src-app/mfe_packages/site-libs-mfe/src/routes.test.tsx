import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import data from './data/libraries.generated.json';
import en from './screens/libs/i18n/en.json';
import { renderLibsAt } from './test-support/renderAt';

vi.mock('@gears-frontx/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@gears-frontx/react')>();
  return {
    ...actual,
    apiRegistry: { getService: () => ({ getLibraries: {} }) },
    useApiQuery: () => ({ data, isLoading: false, isError: false }),
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

describe('libsRouteTree', () => {
  it.each([
    ['/', 'libraries.title'],
    ['/routing', 'routing.title'],
    ['/mfes', 'mfes.title'],
    ['/screen-domain', 'domain.title'],
  ] as const)('renders the page at %s', async (path, titleKey) => {
    renderLibsAt(path);
    expect(await screen.findByRole('heading', { level: 1, name: en[titleKey] })).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it("renders the screen's own not-found page for any other path", async () => {
    renderLibsAt('/nowhere');
    expect(await screen.findByRole('heading', { level: 1, name: en.not_found_title })).toBeTruthy();
  });
});
