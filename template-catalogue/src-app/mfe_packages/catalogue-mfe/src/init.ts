/**
 * The catalogue package's own FrontX app, created once when the entry first loads.
 *
 * `microfrontends()` gives this app the registry `<ExtensionRouter>` builds the screen's router from. The host owns the shared query client; `queryCacheShared()` joins it.
 */
import { createFrontX, effects, gtsPlugin, microfrontends, queryCacheShared } from '@gears-frontx/react';

// @cpt-flow:cpt-template-catalogue-flow-catalogue-screen-mount:p1
// @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-mount:p1:inst-create-app
export const mfeApp = createFrontX()
  .use(effects())
  .use(queryCacheShared())
  .use(microfrontends({ typeSystem: gtsPlugin }))
  .build();
// @cpt-end:cpt-template-catalogue-flow-catalogue-screen-mount:p1:inst-create-app
