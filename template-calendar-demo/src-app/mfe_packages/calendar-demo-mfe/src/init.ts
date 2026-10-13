// @cpt-dod:cpt-template-calendar-demo-dod-calendar-placeholder-screen-frame:p1
// @cpt-algo:cpt-template-calendar-demo-algo-calendar-placeholder-package-app:p1
/**
 * The calendar demo package's own FrontX app, created once when the entry first loads.
 *
 * `microfrontends()` gives this app the registry `<ExtensionRouter>` builds the screen's router from: the screen supplies its route tree to its own app, and the framework resolves the screen's address inside the page URL. The host owns the shared query client; `queryCacheShared()` joins it.
 */
import { createFrontX, effects, gtsPlugin, microfrontends, queryCacheShared } from '@gears-frontx/react';

// @cpt-begin:cpt-template-calendar-demo-algo-calendar-placeholder-package-app:p1:inst-build-app
export const mfeApp = createFrontX()
  .use(effects())
  .use(queryCacheShared())
  .use(microfrontends({ typeSystem: gtsPlugin }))
  .build();
  // @cpt-end:cpt-template-calendar-demo-algo-calendar-placeholder-package-app:p1:inst-build-app
