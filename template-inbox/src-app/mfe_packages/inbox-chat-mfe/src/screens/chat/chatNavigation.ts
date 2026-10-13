import { useMemo } from 'react';
import { useOptionalInboxBridge } from '@inbox-shared/lifecycle/screenContext';
import { isInScreenDomain, openScreen, SHOW_CONTACT_ACTION } from '@inbox-shared/navigation/openScreen';
import { INBOX_SCREENS } from '@inbox-shared/navigation/screens';

export type ChatNavigation = {
  /**
   * Opens a contact's page in the contacts screen, in the chat's own place:
   * the contacts screen mounted, then its `show_contact` action with the
   * person's id; the framework router and the contacts screen's own router
   * write the address, one history entry, so Back returns to the chat as it
   * was left. `undefined` when the chat is not mounted in the
   * shell's screen domain: there is no screen to open, and the chat offers no
   * link to one.
   */
  viewContact: ((contactId: string) => void) | undefined;
};

/** Where the chat screen goes beyond itself, through the shell's screen domain. */
export function useChatNavigation(): ChatNavigation {
  // @cpt-flow:cpt-template-inbox-flow-chat-view-contact:p1
  // @cpt-dod:cpt-template-inbox-dod-chat-view-contact:p1
  const bridge = useOptionalInboxBridge();
  return useMemo(() => {
    // @cpt-begin:cpt-template-inbox-flow-chat-view-contact:p1:inst-check-screen-domain
    if (bridge === undefined || !isInScreenDomain(bridge)) return { viewContact: undefined };
    // @cpt-end:cpt-template-inbox-flow-chat-view-contact:p1:inst-check-screen-domain
    return {
      // @cpt-begin:cpt-template-inbox-flow-chat-view-contact:p1:inst-open-contacts
      viewContact: (contactId: string) => {
        openScreen(bridge, { screen: INBOX_SCREENS.contacts, action: { type: SHOW_CONTACT_ACTION, payload: { contact: contactId } } });
      },
      // @cpt-end:cpt-template-inbox-flow-chat-view-contact:p1:inst-open-contacts
    };
  }, [bridge]);
}
