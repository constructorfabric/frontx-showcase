import { useMemo } from 'react';
import { useNavigate } from '@gears-frontx/routing-tanstack';

export type ContactsNavigation = {
  /** Opens a person's page, `/<contactId>` inside this screen. */
  openContact: (contactId: string) => void;
  /** Opens the directory, `/` inside this screen, in place of the page it leaves in the history, so the browser's Back from the directory never returns to that page. */
  openDirectory: () => void;
};

/**
 * Where the contacts screen goes, through the screen's own router. Inside the
 * shell each call writes this screen's entry in the page address
 * (`?screen=inbox-contacts;route=r-42`), so a person's page is a link a thread can
 * point at and a visitor can reload. Opening a person's page adds a history
 * entry; going back to the directory replaces it.
 */
export function useContactsNavigation(): ContactsNavigation {
  // @cpt-state:cpt-template-inbox-state-contacts-screen-view:p2
  const navigate = useNavigate();
  return useMemo(
    () => ({
      // @cpt-begin:cpt-template-inbox-state-contacts-screen-view:p2:inst-open-person-page
      openContact: (contactId: string) => void navigate({ to: '/$contactId', params: { contactId } }),
      // @cpt-end:cpt-template-inbox-state-contacts-screen-view:p2:inst-open-person-page
      // @cpt-begin:cpt-template-inbox-state-contacts-screen-view:p2:inst-back-to-directory
      openDirectory: () => void navigate({ to: '/', replace: true }),
      // @cpt-end:cpt-template-inbox-state-contacts-screen-view:p2:inst-back-to-directory
    }),
    [navigate]
  );
}
