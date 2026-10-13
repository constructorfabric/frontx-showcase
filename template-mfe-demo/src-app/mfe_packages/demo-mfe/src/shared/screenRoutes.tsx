/**
 * The route-tree pieces every demo-mfe screen shares: the mounted screen's bridge for route components, a one-page route tree (index route plus not-found), and the not-found page.
 *
 * Each entry has its own `routes-<entry>.tsx` that builds its tree with `createScreenRouteTree`, and its lifecycle renders that tree through the framework's `<ExtensionRouter>`.
 */
import { createContext, createElement, useContext, type ComponentType, type ReactNode } from 'react';
import type { ChildMfeBridge } from '@gears-frontx/react';
import { Empty, EmptyDescription, EmptyHeader } from '@gears-frontx/ui-kit';
import { EmptyTitle } from '@gears-frontx/kit-candidates';
import { createRootRoute, createRoute, Outlet, type AnyRoute } from '@gears-frontx/routing-tanstack';

// @cpt-dod:cpt-template-mfe-demo-dod-screen-entries-entries:p1
// @cpt-algo:cpt-template-mfe-demo-algo-screen-entries-screen-route-tree:p1
// @cpt-begin:cpt-template-mfe-demo-algo-screen-entries-screen-route-tree:p1:inst-provide-bridge
const BridgeContext = createContext<ChildMfeBridge | null>(null);

/** Provides the mounted screen's bridge to its route components. */
export function BridgeProvider({ bridge, children }: { bridge: ChildMfeBridge; children: ReactNode }) {
  return <BridgeContext.Provider value={bridge}>{children}</BridgeContext.Provider>;
}

/** The mounted screen's bridge, inside a route component. */
export function useBridge(): ChildMfeBridge {
  const bridge = useContext(BridgeContext);
  if (!bridge) throw new Error('demo-mfe: route rendered outside its screen mount');
  return bridge;
}
// @cpt-end:cpt-template-mfe-demo-algo-screen-entries-screen-route-tree:p1:inst-provide-bridge

// @cpt-begin:cpt-template-mfe-demo-algo-screen-entries-screen-route-tree:p1:inst-not-found-page
/** Rendered for a path inside a screen that names no page of it. */
export function ScreenNotFound() {
  return (
    <Empty data-testid="screen-route-not-found">
      <EmptyHeader>
        <EmptyTitle render={createElement('h1')}>Page not found</EmptyTitle>
        <EmptyDescription>This address names no page of this screen.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
// @cpt-end:cpt-template-mfe-demo-algo-screen-entries-screen-route-tree:p1:inst-not-found-page

/** A screen component that takes the bridge, as every demo-mfe screen does. */
export type BridgeScreen = ComponentType<{ bridge: ChildMfeBridge }>;

/**
 * A screen's route tree: `/` renders the screen; any other path renders the not-found page.
 * @param Screen - the screen component, given the mounted bridge
 */
export function createScreenRouteTree(Screen: BridgeScreen): AnyRoute {
  // @cpt-begin:cpt-template-mfe-demo-algo-screen-entries-screen-route-tree:p1:inst-index-component
  function IndexRoute() {
    return <Screen bridge={useBridge()} />;
  }
  // @cpt-end:cpt-template-mfe-demo-algo-screen-entries-screen-route-tree:p1:inst-index-component
  // @cpt-begin:cpt-template-mfe-demo-algo-screen-entries-screen-route-tree:p1:inst-root-route
  const rootRoute = createRootRoute({ component: Outlet, notFoundComponent: ScreenNotFound });
  // @cpt-end:cpt-template-mfe-demo-algo-screen-entries-screen-route-tree:p1:inst-root-route
  // @cpt-begin:cpt-template-mfe-demo-algo-screen-entries-screen-route-tree:p1:inst-return-tree
  return rootRoute.addChildren([createRoute({ getParentRoute: () => rootRoute, path: '/', component: IndexRoute })]);
  // @cpt-end:cpt-template-mfe-demo-algo-screen-entries-screen-route-tree:p1:inst-return-tree
}
