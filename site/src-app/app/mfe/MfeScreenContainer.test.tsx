import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import axe from 'axe-core';

const mockBootstrapMFE = vi.fn();
const mockUseFrontX = vi.fn();
const mockUseMountedExtensions = vi.fn((_domainId: string): Array<{ id: string }> => []);
const mockUseDomainRouteStatus = vi.fn(
  (_registry: unknown, _domainId: string): { entries: number; unresolved: number } => ({
    entries: 0,
    unresolved: 0,
  }),
);
const mockScreenDomain = { id: 'screen-domain', route: 'screen' };
const FRONTX_SCREEN_DOMAIN = 'screen-domain';
const FRONTX_ACTION_MOUNT_EXT = 'mount-ext';
const mockNavigation = vi.fn((): { entries: unknown[] | undefined } => ({ entries: undefined }));

vi.mock('@/app/layout/useScreenNavigation', () => ({
  useScreenNavigation: () => mockNavigation(),
}));

vi.mock('./bootstrap', () => ({
  bootstrapMFE: (...args: never[]) => mockBootstrapMFE(...args),
}));

vi.mock('@gears-frontx/react', async (importOriginal) => {
  const { useEffect, useRef } = await import('react');
  return {
    ...(await importOriginal<Record<string, never>>()),
    useFrontX: () => mockUseFrontX(),
    useMountedExtensions: (domainId: string) => mockUseMountedExtensions(domainId),
    useDomainRouteStatus: (registry: unknown, domainId: string) => mockUseDomainRouteStatus(registry, domainId),
    useTranslation: () => ({ t: (key: string) => key }),
    screenDomain: mockScreenDomain,
    FRONTX_SCREEN_DOMAIN,
    FRONTX_ACTION_MOUNT_EXT,
    // `ExtensionDomainSlot` itself owns starting/stopping a routed domain's
    // observer (ADR 0036, D10/D11) - its own suite covers that; this fake
    // only stands in for the DOM root this container renders around, handing
    // it to `onAttached` and calling `onDetached` as the real slot does.
    ExtensionDomainSlot: ({
      registry,
      domainId,
      className,
      onAttached,
      onDetached,
    }: {
      registry: { mfeRegistry: Record<string, never> } | null;
      domainId: string;
      className?: string;
      onAttached?: (root: Element) => void;
      onDetached?: () => void;
    }) => {
      const ref = useRef<HTMLDivElement>(null);
      useEffect(() => {
        if (ref.current) onAttached?.(ref.current);
        return () => onDetached?.();
      }, [onAttached, onDetached]);
      return (
        <div
          ref={ref}
          data-testid="extension-domain-slot"
          data-registry-present={registry ? 'yes' : 'no'}
          data-domain-id={domainId}
          data-class-name={className}
        />
      );
    },
  };
});

describe('MfeScreenContainer', () => {
  let app: {
    mfeRegistry: { executeActionsChain: ReturnType<typeof vi.fn> };
    mfeRouter: { navigation: () => { location: () => { pathname: string; search: string } } };
    themeRegistry: { getCurrent: () => { appearance?: 'light' | 'dark' } | undefined; subscribe: (callback: () => void) => () => void };
  };
  // The theme registry's subscribers, so a test can see the stamp unsubscribe.
  let themeListeners: Set<() => void>;
  // The composed address as the shell app's navigation facade reads it.
  let address: { pathname: string; search: string };
  let bootstrap: { resolve: () => void; reject: (error: Error) => void };

  beforeEach(() => {
    // The bootstrap promise this component reuses across a real remount
    // (C8) is hoisted to the SUT module's own scope - resetting the module
    // registry before each test is what gives every test a fresh one,
    // instead of leaking the previous test's (already-settled) promise into
    // this one via the dynamic `import('./MfeScreenContainer')` below.
    vi.resetModules();
    address = { pathname: '/', search: '' };
    themeListeners = new Set();
    app = {
      mfeRegistry: { executeActionsChain: vi.fn() },
      mfeRouter: { navigation: () => ({ location: () => address }) },
      themeRegistry: {
        getCurrent: () => ({ appearance: 'light' }),
        subscribe: (callback) => {
          themeListeners.add(callback);
          return () => themeListeners.delete(callback);
        },
      },
    };
    mockNavigation.mockReset();
    mockNavigation.mockReturnValue({ entries: undefined });
    mockUseFrontX.mockReturnValue(app);
    mockBootstrapMFE.mockReset();
    // Bootstrap settles only when a test says so, inside `act`.
    bootstrap = {
      resolve: () => {},
      reject: () => {},
    };
    mockBootstrapMFE.mockImplementation(
      () =>
        new Promise<void>((resolve, reject) => {
          bootstrap.resolve = resolve;
          bootstrap.reject = reject;
        }),
    );
    mockUseMountedExtensions.mockReset();
    mockUseMountedExtensions.mockReturnValue([]);
    mockUseDomainRouteStatus.mockReset();
    mockUseDomainRouteStatus.mockReturnValue({ entries: 0, unresolved: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function settleBootstrap(): Promise<void> {
    await act(async () => {
      bootstrap.resolve();
    });
  }

  it('renders nothing while bootstrap is pending', async () => {
    const { MfeScreenContainer } = await import('./MfeScreenContainer');

    render(<MfeScreenContainer />);

    expect(screen.queryByTestId('extension-domain-slot')).toBeNull();
  });

  it('bootstraps the MFE runtime only once across re-renders', async () => {
    const { MfeScreenContainer } = await import('./MfeScreenContainer');

    const { rerender } = render(<MfeScreenContainer />);
    rerender(<MfeScreenContainer />);
    rerender(<MfeScreenContainer />);

    expect(mockBootstrapMFE).toHaveBeenCalledTimes(1);
    expect(mockBootstrapMFE).toHaveBeenCalledWith(app);
  });

  it('renders the screen-domain ExtensionDomainSlot after bootstrap succeeds', async () => {
    const { MfeScreenContainer } = await import('./MfeScreenContainer');

    render(<MfeScreenContainer />);
    await settleBootstrap();

    const slot = screen.getByTestId('extension-domain-slot');
    expect(slot.dataset.domainId).toBe(mockScreenDomain.id);
    expect(slot.dataset.registryPresent).toBe('yes');
    expect(slot.dataset.className).toBeTruthy();
  });

  it('stamps the theme appearance on the screen hosts its slot receives, and stops when the slot detaches', async () => {
    const { MfeScreenContainer } = await import('./MfeScreenContainer');

    const view = render(<MfeScreenContainer />);
    await settleBootstrap();

    const host = document.createElement('div');
    host.attachShadow({ mode: 'open' });
    await act(async () => {
      screen.getByTestId('extension-domain-slot').append(host);
    });
    expect(host.getAttribute('data-theme')).toBe('light');
    expect(themeListeners.size).toBe(1);

    view.unmount();
    expect(themeListeners.size).toBe(0);
  });

  it('reads the screen domain status only once bootstrap has settled, not before', async () => {
    const { MfeScreenContainer } = await import('./MfeScreenContainer');

    render(<MfeScreenContainer />);

    // Every call before settling is gated to `undefined` (C1 - no
    // observer-backed status to read before this container's own
    // `ExtensionDomainSlot` has anywhere to mount into).
    expect(mockUseDomainRouteStatus).toHaveBeenLastCalledWith(undefined, FRONTX_SCREEN_DOMAIN);

    await settleBootstrap();

    expect(mockUseDomainRouteStatus).toHaveBeenLastCalledWith(app.mfeRegistry, FRONTX_SCREEN_DOMAIN);
  });

  it('reuses the settled bootstrap across a real remount rather than re-invoking it (C8)', async () => {
    const { MfeScreenContainer } = await import('./MfeScreenContainer');

    // A real remount - unmount, then a LATER, distinct `render()` - not
    // `rerender`, which reuses the same component instance and would pass
    // even with the old per-instance `useRef` guard this test targets.
    const first = render(<MfeScreenContainer />);
    await settleBootstrap();
    expect(screen.getByTestId('extension-domain-slot')).not.toBeNull();
    first.unmount();

    await act(async () => {
      render(<MfeScreenContainer />);
    });

    expect(screen.getByTestId('extension-domain-slot')).not.toBeNull();
    expect(mockBootstrapMFE).toHaveBeenCalledTimes(1);
  });

  it('logs an error and shows the load error state, with no slot, when bootstrap rejects', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { MfeScreenContainer } = await import('./MfeScreenContainer');
    render(<MfeScreenContainer />);
    await act(async () => {
      bootstrap.reject(new Error('boom'));
    });

    expect(errorSpy).toHaveBeenCalled();
    expect(screen.queryByTestId('extension-domain-slot')).toBeNull();
    expect(screen.getByRole('alert').textContent).toContain('layout:screens.loadFailed.title');
    expect(screen.getByRole('button', { name: 'layout:screens.loadFailed.retry' })).not.toBeNull();
  });

  it('shows only the load error state, not the no-screens message, when bootstrap rejects and the navigation lists nothing', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // `useScreenNavigation` answers an empty list once bootstrap has failed.
    mockNavigation.mockReturnValue({ entries: [] });

    const { MfeScreenContainer } = await import('./MfeScreenContainer');
    render(<MfeScreenContainer />);
    await act(async () => {
      bootstrap.reject(new Error('boom'));
    });

    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.queryByText('layout:screens.empty')).toBeNull();
  });

  it('shows the no-screens message when bootstrap settled and no screen is registered', async () => {
    mockNavigation.mockReturnValue({ entries: [] });

    const { MfeScreenContainer } = await import('./MfeScreenContainer');
    render(<MfeScreenContainer />);
    await settleBootstrap();

    expect(screen.getByText('layout:screens.empty')).not.toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  describe('a screen that fails to load', () => {
    it('shows an alert naming the failure, built from the kit, instead of an empty page', async () => {
      const { MfeScreenContainer } = await import('./MfeScreenContainer');
      const { screenLoadFailure } = await import('./screenLoadFailure');
      render(<MfeScreenContainer />);
      await settleBootstrap();
      expect(screen.queryByRole('alert')).toBeNull();

      act(() => screenLoadFailure.report('ext.docs', 'push'));

      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain('layout:screens.loadFailed.title');
      expect(alert.textContent).toContain('layout:screens.loadFailed.description');
      expect(screen.getByTestId('extension-domain-slot')).not.toBeNull();
    });

    // The failed action's own history intent is replayed, so a failed header click (push) keeps the previous page's entry; a URL-driven mount (`none`) retries with push, which the router turns into no write because the address already names the screen.
    it.each([
      ['push', 'push'],
      ['replace', 'replace'],
      ['none', 'push'],
    ] as const)('retries a failed mount whose history intent was %s by mounting the same screen again with %s', async (failed, retried) => {
      const { MfeScreenContainer } = await import('./MfeScreenContainer');
      const { screenLoadFailure } = await import('./screenLoadFailure');
      render(<MfeScreenContainer />);
      await settleBootstrap();
      act(() => screenLoadFailure.report('ext.docs', failed));

      act(() => screen.getByRole('button', { name: 'layout:screens.loadFailed.retry' }).click());

      expect(app.mfeRegistry.executeActionsChain).toHaveBeenCalledWith({
        action: { type: FRONTX_ACTION_MOUNT_EXT, target: FRONTX_SCREEN_DOMAIN, payload: { subject: 'ext.docs', history: retried } },
      });
      expect(screen.queryByRole('alert')).toBeNull();
    });

    it('hides the alert once a later mount clears the failure', async () => {
      const { MfeScreenContainer } = await import('./MfeScreenContainer');
      const { screenLoadFailure } = await import('./screenLoadFailure');
      render(<MfeScreenContainer />);
      await settleBootstrap();
      act(() => screenLoadFailure.report('ext.docs', 'push'));

      act(() => screenLoadFailure.clear());

      expect(screen.queryByRole('alert')).toBeNull();
    });
  });

  it('renders the fallback when every URL entry for the screen domain is unresolved and nothing mounted', async () => {
    mockUseDomainRouteStatus.mockReturnValue({ entries: 1, unresolved: 1 });
    mockUseMountedExtensions.mockReturnValue([]);
    const { MfeScreenContainer } = await import('./MfeScreenContainer');

    render(<MfeScreenContainer />);
    await settleBootstrap();

    expect(screen.getByTestId('screen-route-fallback')).not.toBeNull();
  });

  // The fallback stands in for a screen, so it carries the page's top-level heading, as every screen does.
  it('titles the not-found fallback with the page heading and passes axe', async () => {
    mockUseDomainRouteStatus.mockReturnValue({ entries: 1, unresolved: 1 });
    mockUseMountedExtensions.mockReturnValue([]);
    const { MfeScreenContainer } = await import('./MfeScreenContainer');

    const { container } = render(<MfeScreenContainer />);
    await settleBootstrap();

    const fallback = screen.getByTestId('screen-route-fallback');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('layout:screens.unresolved');
    expect(fallback.contains(screen.getByRole('heading', { level: 1 }))).toBe(true);
    await expectNoAxeViolations(container);
  });

  it('titles the load error state with the page heading', async () => {
    const { MfeScreenContainer } = await import('./MfeScreenContainer');
    const { screenLoadFailure } = await import('./screenLoadFailure');
    const { container } = render(<MfeScreenContainer />);
    await settleBootstrap();
    act(() => screenLoadFailure.report('ext.docs', 'push'));

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('layout:screens.loadFailed.title');
    await expectNoAxeViolations(container);
  });

  it('renders no fallback when the screen domain carries no URL entry', async () => {
    mockUseDomainRouteStatus.mockReturnValue({ entries: 0, unresolved: 0 });
    mockUseMountedExtensions.mockReturnValue([]);
    const { MfeScreenContainer } = await import('./MfeScreenContainer');

    render(<MfeScreenContainer />);
    await settleBootstrap();

    expect(screen.getByTestId('extension-domain-slot')).not.toBeNull();
    expect(screen.queryByTestId('screen-route-fallback')).toBeNull();
  });

  it('renders no fallback once a screen is mounted, even with an unresolved sibling entry', async () => {
    mockUseDomainRouteStatus.mockReturnValue({ entries: 1, unresolved: 1 });
    mockUseMountedExtensions.mockReturnValue([{ id: 'ext.hello-world' }]);
    const { MfeScreenContainer } = await import('./MfeScreenContainer');

    render(<MfeScreenContainer />);
    await settleBootstrap();

    expect(screen.getByTestId('extension-domain-slot')).not.toBeNull();
    expect(screen.queryByTestId('screen-route-fallback')).toBeNull();
  });

  const home = { kind: 'screen', id: 'ext.home', token: 'home', label: 'Home', order: 10, href: './?screen=home', active: false };

  it('opens the screen site.config.json names as home, not the first entry, in place of the bare address, through the mount action with a replace intent', async () => {
    const earlier = { kind: 'screen', id: 'ext.about', token: 'about', label: 'About', order: 1, href: './?screen=about', active: false };
    mockNavigation.mockReturnValue({ entries: [earlier, { kind: 'group', id: 'demos', order: 5, active: false, items: [] }, home] });
    mockUseDomainRouteStatus.mockReturnValue({ entries: 0, unresolved: 0 });
    const { MfeScreenContainer } = await import('./MfeScreenContainer');

    render(<MfeScreenContainer />);
    await settleBootstrap();

    expect(app.mfeRegistry.executeActionsChain).toHaveBeenCalledWith({
      action: { type: FRONTX_ACTION_MOUNT_EXT, target: FRONTX_SCREEN_DOMAIN, payload: { subject: 'ext.home', history: 'replace' } },
    });
  });

  it('reports a configured home that no registered screen carries and opens nothing else', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockNavigation.mockReturnValue({ entries: [{ ...home, id: 'ext.other', token: 'other' }] });
    mockUseDomainRouteStatus.mockReturnValue({ entries: 0, unresolved: 0 });
    const { MfeScreenContainer } = await import('./MfeScreenContainer');

    render(<MfeScreenContainer />);
    await settleBootstrap();

    expect(app.mfeRegistry.executeActionsChain).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('names no registered screen'));
  });

  it('opens no screen at a deep link while the domain status still counts no entry, reading the address through the navigation facade', async () => {
    // The document URL stays bare: only the facade names the deep link, so a container that read `window.location` would open the home screen.
    address = { pathname: '/', search: '?screen=libs;route=routing' };
    mockNavigation.mockReturnValue({ entries: [home] });
    mockUseDomainRouteStatus.mockReturnValue({ entries: 0, unresolved: 0 });
    const { MfeScreenContainer } = await import('./MfeScreenContainer');

    render(<MfeScreenContainer />);
    await settleBootstrap();

    expect(window.location.search).toBe('');
    expect(app.mfeRegistry.executeActionsChain).not.toHaveBeenCalled();
  });

  it('opens no screen when the address already names one', async () => {
    mockNavigation.mockReturnValue({ entries: [home] });
    mockUseDomainRouteStatus.mockReturnValue({ entries: 1, unresolved: 0 });
    const { MfeScreenContainer } = await import('./MfeScreenContainer');

    render(<MfeScreenContainer />);
    await settleBootstrap();

    expect(app.mfeRegistry.executeActionsChain).not.toHaveBeenCalled();
  });
});

/** axe-core over the rendered markup with the WCAG A and AA rules; colour contrast needs a layout engine and is left to the browser checks. */
async function expectNoAxeViolations(container: Element): Promise<void> {
  const result = await axe.run(container, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    rules: { 'color-contrast': { enabled: false } },
  });
  expect(result.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.html).join(' | ')}`)).toEqual([]);
}
