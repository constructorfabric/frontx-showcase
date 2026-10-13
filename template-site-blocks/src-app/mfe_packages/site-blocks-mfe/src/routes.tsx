import { createRootRoute, createRoute, Outlet } from '@gears-frontx/routing-tanstack';
import { BlockPage, BlocksIndex, BlocksNotFound } from './screens/blocks/BlocksPages';

// @cpt-begin:cpt-template-site-blocks-flow-blocks-showcase-open:p1:inst-route-tree
const rootRoute = createRootRoute({ component: Outlet, notFoundComponent: BlocksNotFound });

/**
 * The showcase screen's routes inside its entry: `/` lists the blocks by group, `/$block` renders one block's fixture; any other path renders the screen's not-found page.
 */
export const blocksRouteTree = rootRoute.addChildren([
  createRoute({ getParentRoute: () => rootRoute, path: '/', component: BlocksIndex }),
  createRoute({ getParentRoute: () => rootRoute, path: '/$block', component: BlockPage }),
]);
// @cpt-end:cpt-template-site-blocks-flow-blocks-showcase-open:p1:inst-route-tree
