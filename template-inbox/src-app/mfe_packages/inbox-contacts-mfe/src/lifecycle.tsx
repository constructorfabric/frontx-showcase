import type { ChildMfeBridge, MfeMountContext } from '@gears-frontx/react';
import { InboxScreenLifecycle } from '@inbox-shared/lifecycle/InboxScreenLifecycle';
import { SHOW_CONTACT_ACTION, ShowContactHandler } from '@inbox-shared/navigation/openScreen';
import { contactsCatalogues } from './screens/contacts/i18n/catalogues';
import { mfeApp } from './init';
import { contactsRouteTree } from './routes';

/** The contacts screen: the directory and each person's page. */
export class ContactsLifecycle extends InboxScreenLifecycle {
  constructor() {
    super(mfeApp, { catalogues: contactsCatalogues, routeTree: contactsRouteTree });
  }

  /**
   * Renders the screen, then registers the `show_contact` handler another
   * inbox screen's chain shows a person's page with. Registered before
   * `mount()` returns: the chain's `next` step is dispatched as soon as it does.
   */
  override mount(container: Element | ShadowRoot, bridge: ChildMfeBridge, mountContext?: MfeMountContext): void {
    // @cpt-algo:cpt-template-inbox-algo-contacts-accept-show-contact:p2
    // @cpt-dod:cpt-template-inbox-dod-contacts-show-contact-handler:p1
    // @cpt-begin:cpt-template-inbox-algo-contacts-accept-show-contact:p2:inst-render-screen
    super.mount(container, bridge, mountContext);
    // @cpt-end:cpt-template-inbox-algo-contacts-accept-show-contact:p2:inst-render-screen
    // @cpt-begin:cpt-template-inbox-algo-contacts-accept-show-contact:p2:inst-register-handler
    bridge.registerActionHandler(SHOW_CONTACT_ACTION, new ShowContactHandler(mfeApp));
    // @cpt-end:cpt-template-inbox-algo-contacts-accept-show-contact:p2:inst-register-handler
  }
}

/** Module Federation expects a default export with `mount` and `unmount`. */
export default new ContactsLifecycle();
