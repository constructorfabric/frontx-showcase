/**
 * The FrontX app every inbox screen package builds, once per runtime, from that runtime's own `@gears-frontx/react`: the package's init builds it from its own import, and the test host builds another package's app the same way, so a suite runs the plugins the page runs.
 *
 * - `effects()` and `mock({ enabledByDefault: true })`: this template ships no backend, so the services' mock plugins are switched on (see `registerInboxApi` for the switch a project with one turns off). The services are registered before `build()`, because `mock()` switches the mock plugins of the services already registered.
 * - `queryCacheShared()` joins the host-owned QueryClient, which a mounted MFE must do; there is no `queryCache()` or `QueryClientProvider` here. Every inbox screen reads through that one cache.
 * - `mock()` comes before `queryCacheShared()`. `mock()` announces its initial state with a mock toggle event, and the runtime's `queryCacheShared()` clears the page's whole shared QueryClient on every mock toggle it hears. Initialised first, `mock()` toggles before the shared cache listens, so a package that loads for the first time leaves the reads other screens made in place (a FrontX limitation of `queryCacheShared()`).
 * - `microfrontends()` gives the app the registry the screen's `<ExtensionRouter>` builds its router from.
 */
import type * as FrontX from '@gears-frontx/react';

/** What the inbox app needs of a runtime's `@gears-frontx/react`. */
export type InboxScreenRuntime = Pick<typeof FrontX, 'createFrontX' | 'effects' | 'mock' | 'queryCacheShared' | 'microfrontends' | 'gtsPlugin'>;

/**
 * Builds an inbox screen package's app in `runtime`.
 * @param runtime - the `@gears-frontx/react` of the runtime the app belongs to
 */
// @cpt-algo:cpt-template-inbox-algo-screen-frame-build-app:p1
// @cpt-dod:cpt-template-inbox-dod-screen-frame-app-builder:p1
export function buildInboxScreenApp(runtime: InboxScreenRuntime): FrontX.FrontXApp {
  // @cpt-begin:cpt-template-inbox-algo-screen-frame-build-app:p1:inst-create-app
  return runtime
    .createFrontX()
    // @cpt-end:cpt-template-inbox-algo-screen-frame-build-app:p1:inst-create-app
    // @cpt-begin:cpt-template-inbox-algo-screen-frame-build-app:p1:inst-add-effects
    .use(runtime.effects())
    // @cpt-end:cpt-template-inbox-algo-screen-frame-build-app:p1:inst-add-effects
    // @cpt-begin:cpt-template-inbox-algo-screen-frame-build-app:p1:inst-add-mock-switch
    .use(runtime.mock({ enabledByDefault: true }))
    // @cpt-end:cpt-template-inbox-algo-screen-frame-build-app:p1:inst-add-mock-switch
    // @cpt-begin:cpt-template-inbox-algo-screen-frame-build-app:p1:inst-join-shared-cache
    .use(runtime.queryCacheShared())
    // @cpt-end:cpt-template-inbox-algo-screen-frame-build-app:p1:inst-join-shared-cache
    // @cpt-begin:cpt-template-inbox-algo-screen-frame-build-app:p1:inst-add-microfrontends
    .use(runtime.microfrontends({ typeSystem: runtime.gtsPlugin }))
    // @cpt-end:cpt-template-inbox-algo-screen-frame-build-app:p1:inst-add-microfrontends
    // @cpt-begin:cpt-template-inbox-algo-screen-frame-build-app:p1:inst-build-app
    .build();
    // @cpt-end:cpt-template-inbox-algo-screen-frame-build-app:p1:inst-build-app
}
