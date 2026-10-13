import { useEffect, useState } from 'react';
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createRootRoute, createRoute } from '@gears-frontx/routing-tanstack';
import type { MfeRegistry } from '@gears-frontx/react';
import { createMfeBridgeFixture } from '@frontx-test-utils/createMfeBridgeFixture';
import type { ScreenLayout } from '@inbox-shared/ui/screenLayout';
import { contactsCatalogues } from '../screens/contacts/i18n/catalogues';
import { t } from '../test-support/translate';

/*
 * The router renders its matched routes a commit after it mounts, so a route
 * component alone cannot show what the router saw first. The stand-in for the
 * framework's `<ExtensionRouter>` records the layout every render of it reads,
 * and renders the real route tree over the page path.
 */
const recorder = vi.hoisted(() => ({ renders: [] as ScreenLayout[], readLayout: (): ScreenLayout | undefined => undefined }));
const routerRenders = recorder.renders;
vi.mock('@gears-frontx/react', async (importOriginal) => {
  const original = await importOriginal<typeof import('@gears-frontx/react')>();
  const routingTanstack = await vi.importActual<typeof import('@gears-frontx/routing-tanstack')>('@gears-frontx/routing-tanstack');
  const routing = await vi.importActual<typeof import('@gears-frontx/routing')>('@gears-frontx/routing');
  function RecordingExtensionRouter({ routeTree }: { routeTree: import('@gears-frontx/routing-tanstack').AnyRoute }) {
    const layout = recorder.readLayout();
    if (layout !== undefined) recorder.renders.push(layout);
    const [history] = useState(() => routingTanstack.adaptProviderHistory(routing.resolveNavigationHistory(), undefined));
    return <routingTanstack.EngineProvider routeTree={routeTree} history={history} />;
  }
  return { ...original, ExtensionRouter: RecordingExtensionRouter };
});

// The package's setup file already loaded the frame with the real router;
// a fresh module graph is what lets this file's stand-in reach it.
vi.resetModules();
const { InboxScreenFrame } = await import('@inbox-shared/lifecycle/InboxScreenFrame');
const { useScreenLayout } = await import('@inbox-shared/ui/screenLayout');
const { ScreenRoot } = await import('@inbox-shared/ui/ScreenRoutes');
// The route tree that renders ScreenRoot comes from the same module graph, so its router hooks read the router it renders under.
const routingTanstack = await import('@gears-frontx/routing-tanstack');
const { resolveNavigationHistory } = await import('@gears-frontx/routing');
recorder.readLayout = useScreenLayout;

/** A route tree of one page that records the layout of every render whose effects ran. */
function recordingRouteTree() {
  const committed: ScreenLayout[] = [];
  function Page() {
    const layout = useScreenLayout();
    useEffect(() => {
      committed.push(layout);
    }, [layout]);
    return <output>{layout}</output>;
  }
  const rootRoute = createRootRoute();
  const pageRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Page });
  return { routeTree: rootRoute.addChildren([pageRoute]), committed };
}

const mountFrameAt = (widthPx: number) => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => new DOMRect(0, 0, widthPx, 600));
  window.history.replaceState(null, '', '/');
  const { bridge } = createMfeBridgeFixture({
    extDomainId: 'gts.frontx.mfes.ext.domain.v1~frontx.screensets.layout.screen.v1',
    extensionId: 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.inbox_contacts.screens.contacts.v1',
  });
  routerRenders.length = 0;
  const tree = recordingRouteTree();
  render(<InboxScreenFrame bridge={bridge} catalogues={contactsCatalogues} routeTree={tree.routeTree} registry={{} as MfeRegistry} />);
  return tree;
};

describe('InboxScreenFrame', () => {
  it('mounts the routes only in the layout the measured width picks, so a narrow screen runs no wide pane first', async () => {
    // 400px is 25rem: the single-pane layout.
    const { committed } = mountFrameAt(400);

    expect((await screen.findByRole('status')).textContent).toBe('single');
    expect(committed).toEqual(['single']);
    expect(routerRenders.length).toBeGreaterThan(0);
    expect(new Set(routerRenders)).toEqual(new Set(['single']));
  });

  it('mounts the routes in the wide layout when the frame is wide', async () => {
    const { committed } = mountFrameAt(1200);

    expect((await screen.findByRole('status')).textContent).toBe('wide');
    expect(committed).toEqual(['wide']);
    expect(new Set(routerRenders)).toEqual(new Set(['wide']));
  });

  it("clears a page's failure when the screen's own router moves to another page", async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => new DOMRect(0, 0, 1200, 600));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    window.history.replaceState(null, '', '/broken');
    const { bridge } = createMfeBridgeFixture({
      extDomainId: 'gts.frontx.mfes.ext.domain.v1~frontx.screensets.layout.screen.v1',
      extensionId: 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.inbox_contacts.screens.contacts.v1',
    });
    function Broken(): never {
      throw new Error('broken page');
    }
    const rootRoute = routingTanstack.createRootRoute({ component: ScreenRoot });
    const routeTree = rootRoute.addChildren([
      routingTanstack.createRoute({ getParentRoute: () => rootRoute, path: '/broken', component: Broken }),
      routingTanstack.createRoute({ getParentRoute: () => rootRoute, path: '/fine', component: () => <p>fine page</p> }),
    ]);
    render(<InboxScreenFrame bridge={bridge} catalogues={contactsCatalogues} routeTree={routeTree} registry={{} as MfeRegistry} />);

    expect(await screen.findByText(t('app_error_title'))).toBeTruthy();

    // The stand-in router reads the page path, as a screen previewed alone does; in the shell the same move is the screen's own entry.
    await act(async () => {
      resolveNavigationHistory().push('/fine');
    });

    expect(await screen.findByText('fine page')).toBeTruthy();
    expect(screen.queryByText(t('app_error_title'))).toBeNull();
  });
});
