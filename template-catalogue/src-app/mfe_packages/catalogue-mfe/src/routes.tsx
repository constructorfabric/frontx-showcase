import { createRootRoute, createRoute } from '@gears-frontx/routing-tanstack';
import { CatalogueLayout } from './screens/catalogue/CatalogueLayout';
import { CatalogueIndex, CatalogueNotFound, ComponentPage, FoundationPage } from './screens/catalogue/CataloguePages';

// @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-render-not-found
const rootRoute = createRootRoute({ component: CatalogueLayout, notFoundComponent: CatalogueNotFound });
// @cpt-end:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-render-not-found

// @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-browse-index:p1:inst-match-index-route
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: CatalogueIndex });
// @cpt-end:cpt-template-catalogue-flow-catalogue-screen-browse-index:p1:inst-match-index-route

// @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1:inst-match-component-route
const componentRoute = createRoute({ getParentRoute: () => rootRoute, path: '/components/$slug', component: ComponentPage });
// @cpt-end:cpt-template-catalogue-flow-catalogue-screen-browse-component:p1:inst-match-component-route

// @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-browse-foundation:p1:inst-match-foundation-route
const foundationRoute = createRoute({ getParentRoute: () => rootRoute, path: '/foundations/$slug', component: FoundationPage });
// @cpt-end:cpt-template-catalogue-flow-catalogue-screen-browse-foundation:p1:inst-match-foundation-route

/**
 * The catalogue's routes inside its entry: `/` (index), `/components/<slug>` for each example file and `/foundations/<slug>` for each foundation page. A slug with no page, and any other path, render the catalogue's not-found page.
 */
// @cpt-dod:cpt-template-catalogue-dod-catalogue-screen-routes-navigation:p1
export const catalogueRouteTree = rootRoute.addChildren([indexRoute, componentRoute, foundationRoute]);
