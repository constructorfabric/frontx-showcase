import { render, screen } from '@testing-library/react';
import { resolveNavigationHistory } from '@gears-frontx/routing';
import { adaptProviderHistory, EngineProvider } from '@gears-frontx/routing-tanstack';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMfeBridgeFixture } from '@frontx-test-utils/createMfeBridgeFixture';
import { LAST_PING_PARAM, randomHex, WidgetBridge, widgetARouteTree } from './routes';

/** Renders the widget's route tree at an address, over the page address (the standalone mode of the widget's router). */
function renderAt(address: string) {
  window.history.replaceState(null, '', address);
  const { bridge } = createMfeBridgeFixture({ extDomainId: 'widgets-domain', extensionId: 'widget-alpha-instance' });
  render(
    <WidgetBridge.Provider value={bridge}>
      <EngineProvider routeTree={widgetARouteTree} history={adaptProviderHistory(resolveNavigationHistory(), undefined)} />
    </WidgetBridge.Provider>
  );
  return bridge;
}

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('widgetARouteTree', () => {
  it('shows the instance at the widget root, with its own module copy value and no ping yet', async () => {
    vi.stubGlobal('scrollTo', vi.fn());
    renderAt('/');
    const instance = await screen.findByTestId('widget-a-instance');
    expect(instance.getAttribute('data-instance-id')).toBe('widget-alpha-instance');
    expect(screen.getByTestId('widget-a-random').textContent).toBe(randomHex);
    expect(screen.getByTestId('widget-a-last-ping').getAttribute('data-last-ping')).toBe('');
    vi.unstubAllGlobals();
  });

  it('shows the last ping its own entry parameter carries', async () => {
    vi.stubGlobal('scrollTo', vi.fn());
    renderAt(`/?${LAST_PING_PARAM}=2026-01-01T00:00:00.000Z`);
    expect((await screen.findByTestId('widget-a-last-ping')).getAttribute('data-last-ping')).toBe('2026-01-01T00:00:00.000Z');
    vi.unstubAllGlobals();
  });

  it("renders the widget's not-found page for any other path", async () => {
    vi.stubGlobal('scrollTo', vi.fn());
    renderAt('/nowhere');
    expect(await screen.findByTestId('widget-a-not-found')).toBeTruthy();
    expect(screen.queryByTestId('widget-a-last-ping')).toBeNull();
    vi.unstubAllGlobals();
  });
});
