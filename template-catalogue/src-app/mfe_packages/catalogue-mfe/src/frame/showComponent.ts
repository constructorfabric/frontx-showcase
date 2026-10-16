/**
 * The catalogue's own action: another screen that opens the catalogue at one component's page sends it after the screen domain's `mount_ext`, as the chain's `next` step. The catalogue declares it in its entry's `actions` and its schema in `mfe.json` (`schemas`), whose payload names the component by its slug, one of the catalogue's components; the sender never names the catalogue's routes.
 */
import { ActionHandler, type FrontXApp, type JsonObject } from '@gears-frontx/react';

/** The catalogue's action that shows one component's page: payload `{ component }`, the component's slug. */
export const SHOW_COMPONENT_ACTION = 'gts.frontx.mfes.comm.action.v1~frontx.catalogue.nav.show_component.v1~';

/** Moves the catalogue's own router to the page of the component a `show_component` action names, replacing the entry `mount_ext` just wrote. */
// @cpt-flow:cpt-template-catalogue-flow-cross-screen-navigation-show-component:p1
// @cpt-dod:cpt-template-catalogue-dod-cross-screen-navigation-show-component:p1
export class ShowComponentHandler extends ActionHandler {
  constructor(private readonly app: FrontXApp) {
    super();
  }

  async handleAction(_actionTypeId: string, payload: JsonObject | undefined): Promise<void> {
    // @cpt-begin:cpt-template-catalogue-flow-cross-screen-navigation-show-component:p1:inst-read-component
    const component = payload?.component;
    // The action schema requires a string component; reaching this means the schema and the handler disagree.
    if (typeof component !== 'string') throw new Error('[catalogue] show_component payload has no string component');
    // @cpt-end:cpt-template-catalogue-flow-cross-screen-navigation-show-component:p1:inst-read-component
    // @cpt-begin:cpt-template-catalogue-flow-cross-screen-navigation-show-component:p1:inst-require-router
    const router = this.app.mfeRouter;
    if (!router) throw new Error('[catalogue] show_component: the app was built without microfrontends()');
    // @cpt-end:cpt-template-catalogue-flow-cross-screen-navigation-show-component:p1:inst-require-router
    // @cpt-begin:cpt-template-catalogue-flow-cross-screen-navigation-show-component:p1:inst-replace-entry
    // Resolved per action: the facade reads the occupant value the host supplies at mount.
    router.navigation().replace(`/components/${component}`);
    // @cpt-end:cpt-template-catalogue-flow-cross-screen-navigation-show-component:p1:inst-replace-entry
    // @cpt-begin:cpt-template-catalogue-flow-cross-screen-navigation-show-component:p1:inst-return-settled
    // A refusal above rejects the returned promise, as the mediator expects of a handler.
    return;
    // @cpt-end:cpt-template-catalogue-flow-cross-screen-navigation-show-component:p1:inst-return-settled
  }
}
