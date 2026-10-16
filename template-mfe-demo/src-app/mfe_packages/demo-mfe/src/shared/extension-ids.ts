// @cpt-dod:cpt-template-mfe-demo-dod-package-declarations-declared-entities:p1
// @cpt-algo:cpt-template-mfe-demo-algo-package-declarations-mirror-identifiers:p1
/**
 * Extension IDs from mfe.json
 * Centralized constants for cross-screen navigation references
 */

// @cpt-begin:cpt-template-mfe-demo-algo-package-declarations-mirror-identifiers:p1:inst-screen-ids
export const HELLOWORLD_EXTENSION_ID = 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.demo.screens.helloworld.v1';
export const PROFILE_EXTENSION_ID = 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.demo.screens.profile.v1';
export const THEME_EXTENSION_ID = 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.demo.screens.theme.v1';
/** The site host's demos navigation group (an instance of the shell's nav group type) every screen names in `presentation.group`. */
export const DEMOS_NAV_GROUP_ID = 'gts.frontx.screensets.layout.nav_group.v1~frontx.site.layout.demos.v1';
// @cpt-end:cpt-template-mfe-demo-algo-package-declarations-mirror-identifiers:p1:inst-screen-ids

// @cpt-begin:cpt-template-mfe-demo-algo-package-declarations-mirror-identifiers:p1:inst-refresh-action-id
/**
 * Custom action type for requesting a profile data refresh.
 * Targeted at the Profile extension ID - routed by the mediator to its registered ActionHandler.
 */
export const DEMO_ACTION_REFRESH_PROFILE = 'gts.frontx.mfes.comm.action.v1~frontx.demo.profile.refresh_profile.v1~';
// @cpt-end:cpt-template-mfe-demo-algo-package-declarations-mirror-identifiers:p1:inst-refresh-action-id

// @cpt-begin:cpt-template-mfe-demo-algo-package-declarations-mirror-identifiers:p1:inst-widgets-host-ids
/**
 * Extension ID of the Widgets Host screen extension, owned by the shell's screen
 * domain. Mounting it evicts whatever else occupies that domain (e.g. Hello World
 * itself) per the shell's `ExclusiveMountStrategy`.
 */
export const WIDGETS_HOST_EXTENSION_ID = 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.widgets.host.screen.v1';

/**
 * GTS instance ID of the widgets `ExtensionDomain` that Widgets Host takes
 * ownership of once mounted (`demo-mfe/mfe.json`'s `domains[]`, adopted in
 * `lifecycle-widgets-host.tsx` via `registry.registerDomain(...)`).
 */
export const WIDGETS_DOMAIN_ID = 'gts.frontx.mfes.ext.domain.v1~frontx.widgets.area.main.v1';
// @cpt-end:cpt-template-mfe-demo-algo-package-declarations-mirror-identifiers:p1:inst-widgets-host-ids

// @cpt-begin:cpt-template-mfe-demo-algo-package-declarations-mirror-identifiers:p1:inst-widget-ids
/**
 * Extension ID of widget-a's Widget Alpha instance (widgets-fixture-a), owned by the
 * nested Widgets Host and two hops away from the shell (shell -> Widgets Host ->
 * widgets domain -> widget-a). Pinging it from Hello World (one hop from shell)
 * exercises the downward forwarding-entry tier of cross-nesting action delivery.
 */
export const WIDGET_ALPHA_EXTENSION_ID = 'gts.frontx.mfes.ext.extension.v1~frontx.widgets.fixture_a.widget_alpha.v1';

/**
 * Custom action type used by widgets-fixture-a to demonstrate per-instance ping routing.
 * Targeted at the Widget Alpha extension ID - routed by the mediator to its registered ActionHandler.
 */
export const WIDGET_PING_ACTION_TYPE = 'gts.frontx.mfes.comm.action.v1~frontx.widgets.test.widget_ping.v1~';
// @cpt-end:cpt-template-mfe-demo-algo-package-declarations-mirror-identifiers:p1:inst-widget-ids
