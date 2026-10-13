/**
 * Moving between screens, the FrontX way: the screen domain's `mount_ext` action mounts another screen and the framework router writes its entry in the address. A finer move, to one page of that screen, is a typed action the receiving screen's entry declares (docs `show_guide`, templates `show_template`), sent as the chain's `next` step; the receiving screen's handler moves its own router through its app's navigation facade. A screen never builds another screen's address and never names its routes: the address is a byproduct of the actions.
 */
import { ActionHandler, FRONTX_ACTION_MOUNT_EXT, FRONTX_SCREEN_DOMAIN, type ChildMfeBridge, type FrontXApp, type JsonObject } from '@gears-frontx/react';
import type { ScreenTarget } from '../content/outline';

// @cpt-flow:cpt-template-site-flow-site-links-open-other-screen:p1
// @cpt-dod:cpt-template-site-dod-site-links-open-in-place:p1
/**
 * Mounts a screen in the shell's screen domain and, when the target names an action, sends that action to the mounted screen as the chain's next step.
 * @param bridge - the calling screen's bridge
 * @param target - the screen extension to open and the optional action that shows a page of it
 */
export function openScreen(bridge: ChildMfeBridge, target: ScreenTarget): void {
  // @cpt-begin:cpt-template-site-flow-site-links-open-other-screen:p1:inst-build-mount-action
  const mount = { type: FRONTX_ACTION_MOUNT_EXT, target: FRONTX_SCREEN_DOMAIN, payload: { subject: target.extension } };
  // @cpt-end:cpt-template-site-flow-site-links-open-other-screen:p1:inst-build-mount-action
  // @cpt-begin:cpt-template-site-flow-site-links-open-other-screen:p1:inst-dispatch-chain
  // Dispatch is acceptance-only: it returns nothing and never throws.
  bridge.executeActionsChain(
    target.action === undefined ? { action: mount } : { action: mount, next: { action: { type: target.action.type, target: target.extension, payload: { ...target.action.payload } } } }
  );
  // @cpt-end:cpt-template-site-flow-site-links-open-other-screen:p1:inst-dispatch-chain
}

// @cpt-algo:cpt-template-site-algo-site-links-show-page:p1
/** Moves this screen's own router to the page a typed show action names, through the app's navigation facade, replacing the entry `mount_ext` just wrote. */
export class ShowPageHandler extends ActionHandler {
  /**
   * @param app - the screen package's app, whose router the handler moves
   * @param property - the payload property that names the page
   * @param pathOf - the path inside the screen of the page a payload value names
   */
  constructor(
    private readonly app: FrontXApp,
    private readonly property: string,
    private readonly pathOf: (value: string) => string
  ) {
    super();
  }

  async handleAction(actionTypeId: string, payload: JsonObject | undefined): Promise<void> {
    // @cpt-begin:cpt-template-site-algo-site-links-show-page:p1:inst-read-value
    const value = payload?.[this.property];
    // The action schema requires the property as a string; reaching this means the schema and the handler disagree.
    if (typeof value !== 'string') throw new Error(`[site] ${actionTypeId} payload has no string ${this.property}`);
    // @cpt-end:cpt-template-site-algo-site-links-show-page:p1:inst-read-value
    // @cpt-begin:cpt-template-site-algo-site-links-show-page:p1:inst-require-router
    const router = this.app.mfeRouter;
    if (!router) throw new Error(`[site] ${actionTypeId}: the app was built without microfrontends()`);
    // @cpt-end:cpt-template-site-algo-site-links-show-page:p1:inst-require-router
    // @cpt-begin:cpt-template-site-algo-site-links-show-page:p1:inst-replace-route
    // Resolved per action, not once: the facade reads the occupant value the host supplies at mount.
    router.navigation().replace(this.pathOf(value));
    // @cpt-end:cpt-template-site-algo-site-links-show-page:p1:inst-replace-route
    // @cpt-begin:cpt-template-site-algo-site-links-show-page:p1:inst-return-handled
    // A refusal above rejects the returned promise, as the mediator expects of a handler.
    return;
    // @cpt-end:cpt-template-site-algo-site-links-show-page:p1:inst-return-handled
  }
}

/**
 * Registers a screen's show action handler on its bridge. Called from the lifecycle's `mount()` right after the screen renders: a chain's `next` step is dispatched as soon as `mount()` returns, so a handler registered later (in a React effect) would miss it.
 * @param bridge - the mounted screen's bridge
 * @param actionType - the show action type the screen's entry declares
 * @param handler - the handler bound to the screen's app
 */
export function registerShowPageHandler(bridge: ChildMfeBridge, actionType: string, handler: ShowPageHandler): void {
  // @cpt-begin:cpt-template-site-algo-site-links-show-page:p1:inst-register-handler
  bridge.registerActionHandler(actionType, handler);
  // @cpt-end:cpt-template-site-algo-site-links-show-page:p1:inst-register-handler
}
