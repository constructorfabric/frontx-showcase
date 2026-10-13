/**
 * The docs package's own FrontX app, created once when the entry first loads.
 *
 * The API service is registered before `build()`: the `mock()` plugin switches the mock plugins of the services already registered, on by default because the site has no backend and its data ships with the package. `microfrontends()` gives the app the registry `<ExtensionRouter>` builds the screen's router from; `queryCacheShared()` joins the host's query client.
 */
import { apiRegistry, createFrontX, effects, gtsPlugin, microfrontends, mock, queryCacheShared } from '@gears-frontx/react';
import { DocsApiService } from './api/DocsApiService';

// @cpt-algo:cpt-template-site-algo-data-services-app-setup:p1
// @cpt-dod:cpt-template-site-dod-data-services-app-setup:p1
// @cpt-begin:cpt-template-site-algo-data-services-app-setup:p1:inst-register-service
apiRegistry.register(DocsApiService);
apiRegistry.initialize();
// @cpt-end:cpt-template-site-algo-data-services-app-setup:p1:inst-register-service

// @cpt-begin:cpt-template-site-algo-data-services-app-setup:p1:inst-add-effects
export const mfeApp = createFrontX()
  .use(effects())
  // @cpt-end:cpt-template-site-algo-data-services-app-setup:p1:inst-add-effects
  // @cpt-begin:cpt-template-site-algo-data-services-app-setup:p1:inst-enable-mocks
  .use(mock({ enabledByDefault: true }))
  // @cpt-end:cpt-template-site-algo-data-services-app-setup:p1:inst-enable-mocks
  // @cpt-begin:cpt-template-site-algo-data-services-app-setup:p1:inst-join-query-cache
  // mock() before queryCacheShared(): its initial mock toggle then passes before this runtime's shared cache listens, which would clear the whole page's query cache (a FrontX limitation: queryCacheShared() clears the page's shared cache on every mock toggle it hears).
  .use(queryCacheShared())
  // @cpt-end:cpt-template-site-algo-data-services-app-setup:p1:inst-join-query-cache
  // @cpt-begin:cpt-template-site-algo-data-services-app-setup:p1:inst-add-microfrontends
  .use(microfrontends({ typeSystem: gtsPlugin }))
  // @cpt-end:cpt-template-site-algo-data-services-app-setup:p1:inst-add-microfrontends
  // @cpt-begin:cpt-template-site-algo-data-services-app-setup:p1:inst-build-app
  .build();
  // @cpt-end:cpt-template-site-algo-data-services-app-setup:p1:inst-build-app
