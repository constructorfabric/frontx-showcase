/**
 * widgets-fixture-a - leaf widget MFE lifecycle.
 *
 * Each extension instance is its own loaded copy of this bundle under the
 * per-load blob URL chain (ADR-0004): when this entry is registered as two
 * distinct extension instances (alpha and beta) sharing the same `entry.path`,
 * the parent runtime loads the bundle twice and evaluates this module twice.
 * Module-level state - the random hex and the one FrontX app below - is
 * therefore per extension instance, not shared between alpha and beta.
 *
 * Each mounted instance runs its own tiny router (`route: "/widget-alpha"` /
 * `"/widget-beta"` on the two extensions in `mfe.json`), scoped to the entry
 * address the widgets-host shell broadcast for it. The `last-ping` value the
 * widget shows is not module or React state at all - it lives only in that
 * router's own URL search param (`useSearch`), so a page reload restores it
 * without this module ever "sending" a ping, and two widgets never share or
 * clobber each other's value the way a single shared map would.
 */
import React from 'react';
import {
  createFrontX,
  effects,
  queryCacheShared,
  mock,
  microfrontends,
  gtsPlugin,
  ActionHandler,
  ThemeAwareReactLifecycle,
  ExtensionRouter,
  type ChildMfeBridge,
  type MfeEntryLifecycle,
} from '@gears-frontx/react';
import { LAST_PING_PARAM, randomHex, WidgetBridge, widgetARouteTree } from './routes';

const PING_ACTION_TYPE =
  'gts.frontx.mfes.comm.action.v1~frontx.widgets.test.widget_ping.v1~';



// @cpt-dod:cpt-template-mfe-demo-dod-widget-fixtures-widget-a:p2
// @cpt-algo:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-mounts:p2
// @cpt-begin:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-mounts:p2:inst-build-app
// The one app of this runtime. Each extension instance (alpha, beta) is loaded
// as its own copy of this bundle, so each copy builds exactly one app, here at
// module level. `microfrontends()` builds its registry lazily; the first mount
// reads `app.mfeRegistry` (first statement of `ThemeAwareReactLifecycle.mount`),
// which places the registry's construction inside the mount window so the host
// links it.
const app = createFrontX()
  .use(effects())
  .use(mock())
  // mock() before queryCacheShared(): its initial mock toggle then passes before this runtime's shared cache listens, which would clear the whole page's query cache (a FrontX limitation: queryCacheShared() clears the page's shared cache on every mock toggle it hears).
  .use(queryCacheShared())
  .use(microfrontends({ typeSystem: gtsPlugin }))
  .build();
  // @cpt-end:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-mounts:p2:inst-build-app

// @cpt-flow:cpt-template-mfe-demo-flow-widget-fixtures-answer-ping:p2
class PingHandler extends ActionHandler {
  constructor(
    private readonly instanceId: string,
    private readonly isMounted: () => boolean,
  ) {
    super();
  }

  async handleAction(actionTypeId: string): Promise<void> {
    // @cpt-begin:cpt-template-mfe-demo-flow-widget-fixtures-answer-ping:p2:inst-reject-unmounted
    if (!this.isMounted()) throw new Error(`[widget-a ${this.instanceId}] ping while not mounted`);
    // @cpt-end:cpt-template-mfe-demo-flow-widget-fixtures-answer-ping:p2:inst-reject-unmounted
    // @cpt-begin:cpt-template-mfe-demo-flow-widget-fixtures-answer-ping:p2:inst-ping-time
    const lastPing = new Date().toISOString();
    console.info(`[widget-a ${this.instanceId}] ping ${actionTypeId} ${LAST_PING_PARAM}=${lastPing}`);
    // @cpt-end:cpt-template-mfe-demo-flow-widget-fixtures-answer-ping:p2:inst-ping-time
    // @cpt-begin:cpt-template-mfe-demo-flow-widget-fixtures-answer-ping:p2:inst-write-address
    // D21: each runtime reads AND writes only its own entry's parameters -
    // `location()` reads this occupant's OWN current pathname/search (never
    // a sibling's, never the composed page's), so merging `LAST_PING_PARAM`
    // into it preserves any other search param a caller outside this
    // widget's own render tree already set, instead of overwriting the
    // whole query string from scratch.
    try {
      // Resolved here, not at module level: the router's navigation facade
      // reads the occupant value the host supplies on link adoption, which
      // happens during mount. A facade taken at module evaluation would stay
      // the refusing one.
      const navigation = app.mfeRouter!.navigation();
      const { pathname, search } = navigation.location();
      const params = new URLSearchParams(search);
      params.set(LAST_PING_PARAM, lastPing);
      navigation.replace(`${pathname || '/'}?${params.toString()}`);
      // @cpt-end:cpt-template-mfe-demo-flow-widget-fixtures-answer-ping:p2:inst-write-address
    // @cpt-begin:cpt-template-mfe-demo-flow-widget-fixtures-answer-ping:p2:inst-surface-failure
    } catch (err) {
      // A silent failure here would leave the host believing the ping landed: surface it.
      console.error(`[widget-a ${this.instanceId}] ping navigation failed:`, err);
      throw err;
    }
    // @cpt-end:cpt-template-mfe-demo-flow-widget-fixtures-answer-ping:p2:inst-surface-failure
    // @cpt-begin:cpt-template-mfe-demo-flow-widget-fixtures-answer-ping:p2:inst-return-ping
    return Promise.resolve();
    // @cpt-end:cpt-template-mfe-demo-flow-widget-fixtures-answer-ping:p2:inst-return-ping
  }
}

// @cpt-begin:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-mounts:p2:inst-render-tree
/** One container's React tree: its own `ThemeAwareReactLifecycle` instance, so its own Root (H3). */
class WidgetAMount extends ThemeAwareReactLifecycle {
  constructor() {
    super(app);
  }

  protected renderContent(bridge: ChildMfeBridge): React.ReactNode {
    return (
      <WidgetBridge.Provider value={bridge}>
        <ExtensionRouter registry={app.mfeRegistry!} routeTree={widgetARouteTree} />
      </WidgetBridge.Provider>
    );
  }
}
// @cpt-end:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-mounts:p2:inst-render-tree

// @cpt-state:cpt-template-mfe-demo-state-widget-fixtures-instance-session:p2
/**
 * This runtime can be mounted into a new container while an older container's
 * unmount is still settling, so each container gets its own `WidgetAMount` and
 * Root (H3). The app itself is the one module-level app above, never per mount.
 */
class WidgetsFixtureALifecycle implements MfeEntryLifecycle<ChildMfeBridge> {
  private readonly mounts = new Map<
    Element | ShadowRoot,
    { readonly tree: WidgetAMount; readonly extensionId: string }
  >();

  // @cpt-begin:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-mounts:p2:inst-is-mounted
  private isMounted(extensionId: string): boolean {
    return [...this.mounts.values()].some((mounted) => mounted.extensionId === extensionId);
  }
  // @cpt-end:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-mounts:p2:inst-is-mounted

  // @cpt-begin:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-mounts:p2:inst-mount-container
  mount(container: Element | ShadowRoot, bridge: ChildMfeBridge): void {
    console.info(`[widget-a ${bridge.extensionId}] mount randomHex=${randomHex}`);
    const tree = new WidgetAMount();
    // @cpt-begin:cpt-template-mfe-demo-state-widget-fixtures-instance-session:p2:inst-to-mounted
    this.mounts.set(container, { tree, extensionId: bridge.extensionId });
    // @cpt-end:cpt-template-mfe-demo-state-widget-fixtures-instance-session:p2:inst-to-mounted
    tree.mount(container, bridge);
    // @cpt-end:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-mounts:p2:inst-mount-container
    // @cpt-begin:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-mounts:p2:inst-register-ping
    // Registered synchronously, before `mount()` returns: `DefaultMountManager`
    // treats a lifecycle's `mount()` completion as the signal that the
    // extension is reachable, and lets a chain's `next` continuation dispatch
    // as soon as it does. A React `useEffect` runs strictly after that point
    // (`createRoot().render()` only schedules work), so registering there
    // would be reachable-too-late for a chained ping step.
    bridge.registerActionHandler(
      PING_ACTION_TYPE,
      new PingHandler(bridge.extensionId, () => this.isMounted(bridge.extensionId)),
    );
    // @cpt-end:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-mounts:p2:inst-register-ping
  }

  // @cpt-begin:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-mounts:p2:inst-unmount-container
  unmount(container: Element | ShadowRoot): void | Promise<void> {
    const mounted = this.mounts.get(container);
    if (!mounted) return;
    // @cpt-begin:cpt-template-mfe-demo-state-widget-fixtures-instance-session:p2:inst-to-unmounted
    // Dropped before the teardown so a ping arriving mid-teardown is
    // rejected, not routed into a dying tree; a newer container of the same
    // extension keeps the extension mounted.
    this.mounts.delete(container);
    // @cpt-end:cpt-template-mfe-demo-state-widget-fixtures-instance-session:p2:inst-to-unmounted
    return mounted.tree.unmount(container);
  }
  // @cpt-end:cpt-template-mfe-demo-algo-widget-fixtures-widget-a-mounts:p2:inst-unmount-container
}

const lifecycle = new WidgetsFixtureALifecycle();
export default lifecycle;
