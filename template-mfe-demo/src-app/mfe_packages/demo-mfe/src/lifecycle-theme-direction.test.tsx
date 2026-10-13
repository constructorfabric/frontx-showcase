import type React from 'react';
import { act, render, waitFor, within } from '@testing-library/react';
import { FRONTX_SHARED_PROPERTY_LANGUAGE, FRONTX_SHARED_PROPERTY_THEME } from '@gears-frontx/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMfeBridgeFixture } from '@frontx-test-utils/createMfeBridgeFixture';
import './test-support/stubScroll';

// The framework's router needs the composed page; here each entry's real route tree is rendered over the page address with routing-tanstack itself. The profile query and mutation need the app's query cache, which a bare render does not have.
vi.mock('@gears-frontx/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@gears-frontx/react')>();
  const routingTanstack = await vi.importActual<typeof import('@gears-frontx/routing-tanstack')>('@gears-frontx/routing-tanstack');
  const routing = await vi.importActual<typeof import('@gears-frontx/routing')>('@gears-frontx/routing');
  return {
    ...actual,
    ExtensionRouter: ({ routeTree }: { routeTree: import('@gears-frontx/routing-tanstack').AnyRoute }) => (
      <routingTanstack.EngineProvider routeTree={routeTree} history={routingTanstack.adaptProviderHistory(routing.resolveNavigationHistory(), undefined)} />
    ),
    useApiQuery: () => ({
      data: { user: { id: 'u-1', email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace', role: 'admin', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' } },
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => undefined,
    }),
    useApiMutation: () => ({ mutateAsync: async () => undefined, isPending: false, error: null }),
  };
});

type Hooks = { renderContent: (bridge: ReturnType<typeof createMfeBridgeFixture>['bridge']) => React.ReactNode };

/** Each screen entry with a theme property: every one scopes the kit's tokens to the shell's theme with `data-theme`. */
const ENTRIES = [
  ['Hello World', () => import('./lifecycle-helloworld')],
  ['Profile', () => import('./lifecycle-profile')],
  ['Current Theme', () => import('./lifecycle-theme')],
] as const;

class InertObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): [] {
    return [];
  }
}

// The kit's overlay and carousel components observe their elements; jsdom has no observers and renders no layout.
globalThis.IntersectionObserver ??= InertObserver as unknown as typeof IntersectionObserver;
globalThis.ResizeObserver ??= InertObserver as unknown as typeof ResizeObserver;

afterEach(() => {
  document.body.replaceChildren();
  window.history.replaceState(null, '', '/');
});

describe('demo-mfe screen lifecycles', () => {
  it.each(ENTRIES)("%s: follows the shell's theme and the language's direction on the shadow host", async (_name, load) => {
    const { default: lifecycle } = await load();
    const fixture = createMfeBridgeFixture({
      extDomainId: 'd',
      extensionId: 'e',
      initialProperties: { [FRONTX_SHARED_PROPERTY_THEME]: 'light', [FRONTX_SHARED_PROPERTY_LANGUAGE]: 'en' },
    });
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = host.attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    root.appendChild(container);

    render(<>{(lifecycle as unknown as Hooks).renderContent.call(lifecycle, fixture.bridge)}</>, { container });
    await within(container).findByRole('heading', { level: 1 });

    const shownTheme = () => container.querySelector('[data-theme]')?.getAttribute('data-theme');
    expect(shownTheme()).toBe('light');
    expect(host.dir).toBe('ltr');

    await act(async () => fixture.setProperty(FRONTX_SHARED_PROPERTY_THEME, 'dark'));
    await act(async () => fixture.setProperty(FRONTX_SHARED_PROPERTY_LANGUAGE, 'ar'));
    // A language switch reloads the screen's strings, so the screen shows its placeholder for a moment.
    await waitFor(() => expect(shownTheme()).toBe('dark'));
    expect(host.dir).toBe('rtl');
  });
});
