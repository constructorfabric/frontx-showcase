import { render, screen } from '@testing-library/react';
import { resolveNavigationHistory } from '@gears-frontx/routing';
import { adaptProviderHistory, EngineProvider, type AnyRoute } from '@gears-frontx/routing-tanstack';
import { afterEach, describe, expect, it } from 'vitest';
import { createMfeBridgeFixture } from '@frontx-test-utils/createMfeBridgeFixture';
import { BridgeProvider, createScreenRouteTree } from './shared/screenRoutes';
import { WidgetsHostPage, widgetsHostRouteTree } from './routes-widgets-host';

function renderAt(pathname: string, routeTree: AnyRoute, page: React.ReactNode = null) {
  window.history.replaceState(null, '', pathname);
  const { bridge } = createMfeBridgeFixture({ extDomainId: 'screen-domain', extensionId: 'screen-instance' });
  return render(
    <WidgetsHostPage.Provider value={page}>
      <BridgeProvider bridge={bridge}>
        <EngineProvider routeTree={routeTree} history={adaptProviderHistory(resolveNavigationHistory(), undefined)} />
      </BridgeProvider>
    </WidgetsHostPage.Provider>
  );
}

const probeTree = createScreenRouteTree(({ bridge }) => <p data-testid="probe">{bridge.extensionId}</p>);

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('screen route trees', () => {
  it('render the screen at the screen root, with the mounted bridge', async () => {
    renderAt('/', probeTree);
    expect((await screen.findByTestId('probe')).textContent).toBe('screen-instance');
  });

  it("render the screen's not-found page for any other path", async () => {
    renderAt('/nowhere', probeTree);
    expect(await screen.findByRole('heading', { level: 1, name: 'Page not found' })).toBeTruthy();
    expect(screen.queryByTestId('probe')).toBeNull();
  });

  it('place the Widgets Host page the lifecycle provides at the root', async () => {
    renderAt('/', widgetsHostRouteTree, <p data-testid="widgets-page">host</p>);
    expect(await screen.findByTestId('widgets-page')).toBeTruthy();
  });
});
