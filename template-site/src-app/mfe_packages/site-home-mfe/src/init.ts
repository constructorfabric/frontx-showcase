/**
 * The home package's own FrontX app, created once when the entry first loads.
 *
 * `microfrontends()` gives this app the registry `<ExtensionRouter>` builds the screen's router from: the screen supplies its route tree to its own app, and the framework resolves the screen's address inside the page URL. The host owns the shared query client; `queryCacheShared()` joins it.
 */
import { createFrontX, effects, gtsPlugin, microfrontends, queryCacheShared } from '@gears-frontx/react';

// @cpt-algo:cpt-template-site-algo-screen-frame-home-app:p2
// @cpt-dod:cpt-template-site-dod-screen-frame-lifecycle:p1
// @cpt-begin:cpt-template-site-algo-screen-frame-home-app:p1:inst-add-effects
export const mfeApp = createFrontX()
  .use(effects())
  // @cpt-end:cpt-template-site-algo-screen-frame-home-app:p1:inst-add-effects
  // @cpt-begin:cpt-template-site-algo-screen-frame-home-app:p1:inst-join-query-cache
  .use(queryCacheShared())
  // @cpt-end:cpt-template-site-algo-screen-frame-home-app:p1:inst-join-query-cache
  // @cpt-begin:cpt-template-site-algo-screen-frame-home-app:p1:inst-add-microfrontends
  .use(microfrontends({ typeSystem: gtsPlugin }))
  // @cpt-end:cpt-template-site-algo-screen-frame-home-app:p1:inst-add-microfrontends
  // @cpt-begin:cpt-template-site-algo-screen-frame-home-app:p1:inst-build-app
  .build();
  // @cpt-end:cpt-template-site-algo-screen-frame-home-app:p1:inst-build-app
