import {
  ActionHandler,
  FRONTX_ACTION_MOUNT_EXT,
  FRONTX_SCREEN_DOMAIN,
  screenDomain,
  type ChildMfeBridge,
  type FrontXApp,
  type JsonObject,
} from '@gears-frontx/react';
import { INBOX_SCREEN_EXTENSIONS, type InboxScreenToken } from './screens';

/**
 * The contacts screen's action that shows one person's page: payload
 * `{ contact }`, the person's id. The contacts entry declares it in its
 * `actions` and its schema in `mfe.json` (`schemas`); a screen that opens a
 * person's page sends it and never names the contacts screen's routes.
 */
// @cpt-dod:cpt-template-inbox-dod-cross-screen-navigation-open-screen:p1
export const SHOW_CONTACT_ACTION = 'gts.frontx.mfes.comm.action.v1~frontx.inbox_contacts.action.show_contact.v1~';

/**
 * Whether the bridge belongs to a screen composed into the shell's screen domain, the only place `openScreen` can navigate in.
 * @param bridge - The caller's bridge
 */
// @cpt-algo:cpt-template-inbox-algo-cross-screen-navigation-screen-domain:p1
export function isInScreenDomain(bridge: ChildMfeBridge): boolean {
  // @cpt-begin:cpt-template-inbox-algo-cross-screen-navigation-screen-domain:p1:inst-compare-domain
  return bridge.extDomainId === screenDomain.id;
  // @cpt-end:cpt-template-inbox-algo-cross-screen-navigation-screen-domain:p1:inst-compare-domain
}

export type OpenScreenTarget = {
  /** The screen to open, by its address token (`INBOX_SCREENS`). */
  screen: InboxScreenToken;
  /** The typed action the target's entry declares that shows one page of it, sent once it is mounted; none opens the screen at its root. */
  action?: { type: string; payload: Record<string, string> };
};

/**
 * Opens another inbox screen in the caller's place, at one page of it ("View
 * contact" in chat opens the person's page in contacts), the way
 * template-mfe's Hello World opens Profile and refreshes it: the screen
 * domain's `mount_ext` mounts the target and the framework router writes its
 * entry, then a `next` step sends the target's own typed action, whose
 * handler replaces that entry with the page through its own navigation
 * facade. One history entry, and Back returns to the caller as it was. No
 * inbox code writes the page address or names another screen's routes.
 *
 * @param bridge - The caller's bridge, read for the domain it occupies
 * @param target - The screen and the action that shows its page
 * @returns Whether the chain was sent: `false` when the caller does not
 *   occupy the shell's screen domain, where there is no domain to navigate
 *   in and the caller should not offer the link
 */
// @cpt-flow:cpt-template-inbox-flow-cross-screen-navigation-open-screen:p1
export function openScreen(bridge: ChildMfeBridge, target: OpenScreenTarget): boolean {
  // @cpt-begin:cpt-template-inbox-flow-cross-screen-navigation-open-screen:p1:inst-refuse-outside-domain
  if (!isInScreenDomain(bridge)) return false;
  // @cpt-end:cpt-template-inbox-flow-cross-screen-navigation-open-screen:p1:inst-refuse-outside-domain
  // @cpt-begin:cpt-template-inbox-flow-cross-screen-navigation-open-screen:p1:inst-resolve-extension
  const extensionId = INBOX_SCREEN_EXTENSIONS[target.screen];
  // @cpt-end:cpt-template-inbox-flow-cross-screen-navigation-open-screen:p1:inst-resolve-extension
  // @cpt-begin:cpt-template-inbox-flow-cross-screen-navigation-open-screen:p1:inst-build-mount
  const mount = { type: FRONTX_ACTION_MOUNT_EXT, target: FRONTX_SCREEN_DOMAIN, payload: { subject: extensionId } };
  // @cpt-end:cpt-template-inbox-flow-cross-screen-navigation-open-screen:p1:inst-build-mount
  // @cpt-begin:cpt-template-inbox-flow-cross-screen-navigation-open-screen:p1:inst-send-chain
  // Dispatch is acceptance-only: it returns nothing and never throws.
  bridge.executeActionsChain(
    target.action === undefined ? { action: mount } : { action: mount, next: { action: { type: target.action.type, target: extensionId, payload: { ...target.action.payload } } } }
  );
  // @cpt-end:cpt-template-inbox-flow-cross-screen-navigation-open-screen:p1:inst-send-chain
  // @cpt-begin:cpt-template-inbox-flow-cross-screen-navigation-open-screen:p1:inst-return-sent
  return true;
  // @cpt-end:cpt-template-inbox-flow-cross-screen-navigation-open-screen:p1:inst-return-sent
}

/** Moves the contacts screen's own router to the person's page a `show_contact` action names, replacing the entry `mount_ext` just wrote. */
// @cpt-dod:cpt-template-inbox-dod-cross-screen-navigation-show-contact-handler:p1
// @cpt-flow:cpt-template-inbox-flow-cross-screen-navigation-handle-show-contact:p1
export class ShowContactHandler extends ActionHandler {
  constructor(private readonly app: FrontXApp) {
    super();
  }

  async handleAction(_actionTypeId: string, payload: JsonObject | undefined): Promise<void> {
    // @cpt-begin:cpt-template-inbox-flow-cross-screen-navigation-handle-show-contact:p1:inst-read-contact
    const contact = payload?.contact;
    // @cpt-end:cpt-template-inbox-flow-cross-screen-navigation-handle-show-contact:p1:inst-read-contact
    // @cpt-begin:cpt-template-inbox-flow-cross-screen-navigation-handle-show-contact:p1:inst-reject-missing-contact
    // The action schema requires a non-empty string contact; reaching this means the schema and the handler disagree.
    if (typeof contact !== 'string' || contact === '') throw new Error('[inbox] show_contact payload has no non-empty string contact');
    // @cpt-end:cpt-template-inbox-flow-cross-screen-navigation-handle-show-contact:p1:inst-reject-missing-contact
    // @cpt-begin:cpt-template-inbox-flow-cross-screen-navigation-handle-show-contact:p1:inst-require-router
    const router = this.app.mfeRouter;
    if (!router) throw new Error('[inbox] show_contact: the package app was built without microfrontends()');
    // @cpt-end:cpt-template-inbox-flow-cross-screen-navigation-handle-show-contact:p1:inst-require-router
    // @cpt-begin:cpt-template-inbox-flow-cross-screen-navigation-handle-show-contact:p1:inst-replace-entry
    // The id is one path segment of the contacts router: encoded, so an id carrying `/` or `?` still names one person's page. The facade is resolved per action: it reads the occupant value the host supplies at mount.
    router.navigation().replace(`/${encodeURIComponent(contact)}`);
    // @cpt-end:cpt-template-inbox-flow-cross-screen-navigation-handle-show-contact:p1:inst-replace-entry
    // @cpt-begin:cpt-template-inbox-flow-cross-screen-navigation-handle-show-contact:p1:inst-return-handled
    // A refusal above rejects the returned promise, as the mediator expects of a handler.
    return;
    // @cpt-end:cpt-template-inbox-flow-cross-screen-navigation-handle-show-contact:p1:inst-return-handled
  }
}
