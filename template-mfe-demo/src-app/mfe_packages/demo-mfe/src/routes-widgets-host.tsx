import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { createRootRoute, createRoute, Outlet } from '@gears-frontx/routing-tanstack';
import { ScreenNotFound } from './shared/screenRoutes';

// @cpt-dod:cpt-template-mfe-demo-dod-widgets-nested-domain-settled-mount:p1
// @cpt-algo:cpt-template-mfe-demo-algo-widgets-nested-domain-route-tree:p1
// @cpt-begin:cpt-template-mfe-demo-algo-widgets-nested-domain-route-tree:p1:inst-index-page
/**
 * The Widgets Host page, as the lifecycle builds it for the current mount. The page carries per-mount state (the runtime bootstrap and the slot-attached signal), so the lifecycle provides the rendered page and the route only places it.
 */
export const WidgetsHostPage = createContext<ReactNode>(null);
// @cpt-end:cpt-template-mfe-demo-algo-widgets-nested-domain-route-tree:p1:inst-index-page

// @cpt-begin:cpt-template-mfe-demo-algo-widgets-nested-domain-route-tree:p1:inst-not-found-settles
/**
 * Called when the screen renders its not-found page instead of the host page. The lifecycle's `mount()` waits for the host page to attach the widgets domain; without the host page nothing would attach, so the not-found page settles that wait instead.
 */
export const WidgetsHostNotFound = createContext<() => void>(() => {});
// @cpt-end:cpt-template-mfe-demo-algo-widgets-nested-domain-route-tree:p1:inst-not-found-settles

// @cpt-begin:cpt-template-mfe-demo-algo-widgets-nested-domain-route-tree:p1:inst-index-page
function IndexRoute() {
  return <>{useContext(WidgetsHostPage)}</>;
}
// @cpt-end:cpt-template-mfe-demo-algo-widgets-nested-domain-route-tree:p1:inst-index-page

// @cpt-begin:cpt-template-mfe-demo-algo-widgets-nested-domain-route-tree:p1:inst-not-found-settles
function NotFoundRoute() {
  const settle = useContext(WidgetsHostNotFound);
  useEffect(() => {
    settle();
  }, [settle]);
  return <ScreenNotFound />;
}
// @cpt-end:cpt-template-mfe-demo-algo-widgets-nested-domain-route-tree:p1:inst-not-found-settles

// @cpt-begin:cpt-template-mfe-demo-algo-widgets-nested-domain-route-tree:p1:inst-route-tree
const rootRoute = createRootRoute({ component: Outlet, notFoundComponent: NotFoundRoute });

/** The Widgets Host screen's routes inside its entry: `/` renders the host page; any other path renders the not-found page, which settles the mount. The `widgets` domain's own entries (`&widgets=...`) are a separate domain of the URL, not routes of this screen. */
export const widgetsHostRouteTree = rootRoute.addChildren([createRoute({ getParentRoute: () => rootRoute, path: '/', component: IndexRoute })]);
// @cpt-end:cpt-template-mfe-demo-algo-widgets-nested-domain-route-tree:p1:inst-route-tree
