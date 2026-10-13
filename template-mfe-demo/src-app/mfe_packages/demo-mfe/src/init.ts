/**
 * MFE Bootstrap
 *
 * Creates the MFE-local FrontX app instance, registers slices with effects,
 * and registers API services. This module is imported once (as a side effect)
 * by ThemeAwareReactLifecycle, which provides the FrontXProvider to all screens.
 *
 * The MFE bundles its own copy of @gears-frontx/react, giving it isolated singletons:
 * - eventBus (no cross-MFE event leakage)
 * - apiRegistry (isolated service instances)
 * - storeInstance (isolated Redux store)
 */

import {
  createFrontX,
  apiRegistry,
  effects,
  gtsPlugin,
  microfrontends,
  mock,
  queryCacheShared,
  type FrontXApp,
  type MfeRegistry,
} from '@gears-frontx/react';
import { AccountsApiService } from './api/AccountsApiService';

// @cpt-dod:cpt-template-mfe-demo-dod-demo-app-package-app:p1
// @cpt-algo:cpt-template-mfe-demo-algo-demo-app-build-app:p1
// @cpt-begin:cpt-template-mfe-demo-algo-demo-app-build-app:p1:inst-register-services
// Register API services BEFORE build - mock plugin syncs during build(),
// so services must already be present for mock activation to find them
apiRegistry.register(AccountsApiService);
apiRegistry.initialize();
// @cpt-end:cpt-template-mfe-demo-algo-demo-app-build-app:p1:inst-register-services

// @cpt-begin:cpt-template-mfe-demo-algo-demo-app-build-app:p1:inst-build-app
// Create the MFE-local app shell only.
// queryCacheShared() joins the host-owned QueryClient without reconfiguring it.
// microfrontends() gives the app the registry each screen's <ExtensionRouter> builds its router from.
const mfeApp = createFrontX()
  .use(effects())
  .use(mock())
  // mock() before queryCacheShared(): its initial mock toggle then passes before this runtime's shared cache listens, which would clear the whole page's query cache (a FrontX limitation: queryCacheShared() clears the page's shared cache on every mock toggle it hears).
  .use(queryCacheShared())
  .use(microfrontends({ typeSystem: gtsPlugin }))
  .build();
  // @cpt-end:cpt-template-mfe-demo-algo-demo-app-build-app:p1:inst-build-app

// @cpt-begin:cpt-template-mfe-demo-algo-demo-app-build-app:p1:inst-return-registry
/**
 * The registry `<ExtensionRouter>` builds a screen's router from. Read at render time: the registry is built inside the first mount window, so the host links it.
 * @param app - the package's app
 */
function mfeRegistryOf(app: FrontXApp): MfeRegistry {
  const registry = app.mfeRegistry;
  if (!registry) throw new Error('demo-mfe: the app was built without microfrontends()');
  return registry;
}
// @cpt-end:cpt-template-mfe-demo-algo-demo-app-build-app:p1:inst-return-registry

export { mfeApp, mfeRegistryOf };
