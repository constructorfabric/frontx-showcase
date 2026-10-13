import React from 'react';
import type { ChildMfeBridge } from '@gears-frontx/react';
import { ExtensionRouter } from '@gears-frontx/react';
import { KitThemedLifecycle } from './shared/KitThemedLifecycle';
import { mfeApp, mfeRegistryOf } from './init';
import { themeRouteTree } from './routes-theme';
import { BridgeProvider } from './shared/screenRoutes';

// @cpt-dod:cpt-template-mfe-demo-dod-screen-entries-entries:p1
// @cpt-flow:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1
// @cpt-begin:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1:inst-choose-base
class CurrentThemeLifecycle extends KitThemedLifecycle {
  constructor() {
    super(mfeApp);
  }
  // @cpt-end:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1:inst-choose-base

  // @cpt-begin:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1:inst-render-route-tree
  protected renderContent(bridge: ChildMfeBridge): React.ReactNode {
    return (
      <BridgeProvider bridge={bridge}>
        <ExtensionRouter registry={mfeRegistryOf(mfeApp)} routeTree={themeRouteTree} />
      </BridgeProvider>
    );
  }
  // @cpt-end:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1:inst-render-route-tree
}

// @cpt-begin:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1:inst-export-entry
/**
 * Export a singleton instance of the lifecycle class.
 * Module Federation expects a default export; the handler calls
 * moduleFactory() which returns this module, then validates it
 * has mount/unmount methods.
 */
export default new CurrentThemeLifecycle();
// @cpt-end:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1:inst-export-entry
