/**
 * widgets-fixture-b - leaf widget MFE lifecycle.
 *
 * Renders a labelled card inside the widgets domain slot. Mounts concurrently
 * alongside widgets-fixture-a's alpha/beta instances under the widgets domain's
 * `ConcurrentMountStrategy` (owned by demo-mfe's child FrontX app at runtime).
 */
import React from 'react';
import {
  createFrontX,
  effects,
  queryCacheShared,
  mock,
  ThemeAwareReactLifecycle,
  type ChildMfeBridge,
  type MfeMountContext,
} from '@gears-frontx/react';
import { Item, ItemContent, ItemDescription, ItemTitle } from '@gears-frontx/ui-kit';

// @cpt-dod:cpt-template-mfe-demo-dod-widget-fixtures-widget-b:p2
// @cpt-algo:cpt-template-mfe-demo-algo-widget-fixtures-widget-b:p2
// @cpt-begin:cpt-template-mfe-demo-algo-widget-fixtures-widget-b:p2:inst-build-app
const fixtureApp = createFrontX()
  .use(effects())
  .use(mock())
  // mock() before queryCacheShared(): its initial mock toggle then passes before this runtime's shared cache listens, which would clear the whole page's query cache (a FrontX limitation: queryCacheShared() clears the page's shared cache on every mock toggle it hears).
  .use(queryCacheShared())
  .build();
  // @cpt-end:cpt-template-mfe-demo-algo-widget-fixtures-widget-b:p2:inst-build-app

class WidgetsFixtureBLifecycle extends ThemeAwareReactLifecycle {
  constructor() {
    super(fixtureApp);
  }

  // @cpt-begin:cpt-template-mfe-demo-algo-widget-fixtures-widget-b:p2:inst-log-mount
  // One mount log line, at the same console.info level as widget-a's own
  // mount and ping logs - the live run and any manual trace through the
  // console tell the two fixtures' mounts apart the same way (H2, Q1).
  override mount(container: Element | ShadowRoot, bridge: ChildMfeBridge, mountContext?: MfeMountContext): void {
    console.info(`[widget-b ${bridge.extensionId}] mount`);
    super.mount(container, bridge, mountContext);
  }
  // @cpt-end:cpt-template-mfe-demo-algo-widget-fixtures-widget-b:p2:inst-log-mount

  // @cpt-begin:cpt-template-mfe-demo-algo-widget-fixtures-widget-b:p2:inst-render-card
  protected renderContent(_bridge: ChildMfeBridge): React.ReactNode {
    // One kit Item on the muted surface; its tokens come from the nested widgets screen's tree, which carries the kit's tokens on its shadow host.
    return (
      <Item variant="muted" data-fixture-id="widgets-fixture-b">
        <ItemContent>
          <ItemTitle>Widget B (fixture-b)</ItemTitle>
          <ItemDescription>Mounted concurrently in the widgets domain.</ItemDescription>
        </ItemContent>
      </Item>
    );
  }
  // @cpt-end:cpt-template-mfe-demo-algo-widget-fixtures-widget-b:p2:inst-render-card
}

export default new WidgetsFixtureBLifecycle();
