import { createRootRoute, createRoute, Outlet, useParams } from '@gears-frontx/routing-tanstack';
import { useInboxT } from '@inbox-shared/lifecycle/screenContext';
import { useRouteFocus } from '@inbox-shared/lifecycle/useRouteFocus';
import { ScreenNotFound, ScreenRoot } from '@inbox-shared/ui/ScreenRoutes';
import { ContactsScreen } from './screens/contacts/ContactsScreen';

/**
 * The screen's own routes, inside the entry the shell addressed for it:
 *
 * - `/` - the directory;
 * - `/$contactId` - a person's page, `?screen=inbox-contacts;route=r-42` in the
 *   page address.
 *
 * Both render one `ContactsScreen`, from a pathless layout route above them,
 * and the two child routes only name the address. That is what keeps the
 * directory mounted behind a person's page: its filter, search, sort order
 * and table page are still there on the way back. An address neither child
 * matches never reaches the layout, so the not-found page stands alone
 * rather than under the directory.
 */
function ContactsLayout() {
  // @cpt-flow:cpt-template-inbox-flow-contacts-open-person-page:p1
  const t = useInboxT();
  // @cpt-begin:cpt-template-inbox-flow-contacts-open-person-page:p1:inst-read-route
  const { contactId } = useParams({ strict: false });
  useRouteFocus(contactId ?? '');
  // @cpt-end:cpt-template-inbox-flow-contacts-open-person-page:p1:inst-read-route
  return (
    <>
      <ContactsScreen openContactId={contactId ?? null} t={t} />
      <Outlet />
    </>
  );
}

const rootRoute = createRootRoute({
  component: ScreenRoot,
  // @cpt-begin:cpt-template-inbox-flow-contacts-open-person-page:p1:inst-route-not-found
  notFoundComponent: () => <ScreenNotFound testId="contacts-route-not-found" />,
  // @cpt-end:cpt-template-inbox-flow-contacts-open-person-page:p1:inst-route-not-found
});

const layoutRoute = createRoute({ getParentRoute: () => rootRoute, id: 'contacts', component: ContactsLayout });

const directoryRoute = createRoute({ getParentRoute: () => layoutRoute, path: '/', component: () => null });

const contactRoute = createRoute({ getParentRoute: () => layoutRoute, path: '$contactId', component: () => null });

export const contactsRouteTree = rootRoute.addChildren([layoutRoute.addChildren([directoryRoute, contactRoute])]);
