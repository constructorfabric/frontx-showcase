import { createRootRoute, createRoute, Outlet } from '@gears-frontx/routing-tanstack';
import { HomeScreen } from './screens/home/HomeScreen';
import { NotFound } from './screens/home/NotFound';
import { useBridge } from './shared/ScreenFrame';

// @cpt-begin:cpt-template-site-flow-home-screen-open-landing:p1:inst-route-root
function HomeRoute() {
  return <HomeScreen bridge={useBridge()} />;
}
// @cpt-end:cpt-template-site-flow-home-screen-open-landing:p1:inst-route-root

// @cpt-begin:cpt-template-site-flow-home-screen-unknown-path:p2:inst-route-not-found
const rootRoute = createRootRoute({
  component: Outlet,
  notFoundComponent: NotFound,
});
// @cpt-end:cpt-template-site-flow-home-screen-unknown-path:p2:inst-route-not-found

// @cpt-begin:cpt-template-site-flow-home-screen-open-landing:p1:inst-route-root
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomeRoute });
// @cpt-end:cpt-template-site-flow-home-screen-open-landing:p1:inst-route-root

/** The home screen's routes inside its entry: `/` only; any other path renders the screen's not-found page. */
// @cpt-dod:cpt-template-site-dod-home-screen-registration:p1
export const homeRouteTree = rootRoute.addChildren([indexRoute]);
