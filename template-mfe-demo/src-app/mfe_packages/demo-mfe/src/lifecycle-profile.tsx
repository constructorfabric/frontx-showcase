import React from 'react';
import type { ChildMfeBridge, JsonObject } from '@gears-frontx/react';
import { ActionHandler, ExtensionRouter } from '@gears-frontx/react';
import { KitThemedLifecycle } from './shared/KitThemedLifecycle';
import { mfeApp, mfeRegistryOf } from './init';
import { profileRouteTree } from './routes-profile';
import { BridgeProvider } from './shared/screenRoutes';
import { fetchUser } from './actions/profileActions';
import { DEMO_ACTION_REFRESH_PROFILE } from './shared/extension-ids';

// @cpt-dod:cpt-template-mfe-demo-dod-screen-entries-entries:p1
// @cpt-flow:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1
// @cpt-begin:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1:inst-handle-refresh
class ProfileRefreshHandler extends ActionHandler {
  handleAction(
    _actionTypeId: string,
    _payload: JsonObject | undefined
  ): Promise<void> {
    fetchUser();
    return Promise.resolve();
  }
}
// @cpt-end:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1:inst-handle-refresh

// @cpt-begin:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1:inst-choose-base
class ProfileLifecycle extends KitThemedLifecycle {
  constructor() {
    super(mfeApp);
  }
  // @cpt-end:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1:inst-choose-base

  // @cpt-begin:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1:inst-render-route-tree
  protected renderContent(bridge: ChildMfeBridge): React.ReactNode {
    return (
      <BridgeProvider bridge={bridge}>
        <ExtensionRouter registry={mfeRegistryOf(mfeApp)} routeTree={profileRouteTree} />
      </BridgeProvider>
    );
  }
  // @cpt-end:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1:inst-render-route-tree

  // @cpt-begin:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1:inst-if-data-loading
  override mount(container: Element | ShadowRoot, bridge: ChildMfeBridge): void {
    // @cpt-begin:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1:inst-render-first
    // Let the base class render the React tree first so the screen is visible
    // before any action can arrive.
    super.mount(container, bridge);
    // @cpt-end:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1:inst-render-first
    // @cpt-begin:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1:inst-register-handler
    // Register after rendering so that any synchronous action dispatched in the
    // chained next step finds the handler already in place.
    bridge.registerActionHandler(DEMO_ACTION_REFRESH_PROFILE, new ProfileRefreshHandler());
    // @cpt-end:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1:inst-register-handler
  }
  // @cpt-end:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1:inst-if-data-loading
}

// @cpt-begin:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1:inst-export-entry
/**
 * Export a singleton instance of the lifecycle class.
 * Module Federation expects a default export; the handler calls
 * moduleFactory() which returns this module, then validates it
 * has mount/unmount methods.
 */
export default new ProfileLifecycle();
// @cpt-end:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1:inst-export-entry
