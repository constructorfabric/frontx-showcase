import { useCallback, useMemo } from 'react';
import { PanelLeftIcon, SearchIcon, UserXIcon } from 'lucide-react';
import {
  Button,
  Empty,
  EmptyActions,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  Input,
} from '@gears-frontx/ui-kit';
import { EmptyTitle, Heading, Text } from '@gears-frontx/kit-candidates';
import { useApiQuery, useAppSelector } from '@gears-frontx/react';
import { getInboxApi } from '@inbox-shared/api/registry';
import { PagePane, PagePaneBody, PagePaneHeader } from '@inbox-shared/blocks/PagePane';
import { PaneState } from '@inbox-shared/blocks/PaneState';
import type { Translate } from '@inbox-shared/i18n/translate';
import { firstPaintOf, LoadErrorPane, LoadingPane } from '@inbox-shared/ui/QueryStates';
import { ScreenHeading } from '@inbox-shared/ui/ScreenHeading';
import { useSidebarToggle } from '@inbox-shared/ui/useSidebarToggle';
import { conversationStarts } from './contactActivity';
import { ContactDetail } from './ContactDetail';
import { ContactFilterSidebar } from './ContactFilterSidebar';
import { ContactsTable } from './ContactsTable';
import { useContactsNavigation } from './contactsNavigation';
import { selectContacts } from './contactFilters';
import { contactsActions } from '../../actions/contactsActions';
import { selectContactsDirectory } from '../../slices/contactsSlice';

export type ContactsScreenProps = {
  /**
   * The contact whose page is open, or `null` for the directory. It comes from
   * the screen's route (`/$contactId`) rather than from state here, which is
   * what makes a person's page a link a thread can point at and a visitor can
   * bookmark.
   */
  openContactId: string | null;
  t: Translate;
};

export function ContactsScreen({ openContactId, t }: ContactsScreenProps) {
  // @cpt-flow:cpt-template-inbox-flow-contacts-browse-directory:p1
  // @cpt-flow:cpt-template-inbox-flow-contacts-open-person-page:p1
  // @cpt-dod:cpt-template-inbox-dod-contacts-directory:p1
  // @cpt-dod:cpt-template-inbox-dod-contacts-person-page:p1
  const service = getInboxApi();
  const navigation = useContactsNavigation();

  // @cpt-begin:cpt-template-inbox-flow-contacts-browse-directory:p1:inst-read-collections
  const contactsQuery = useApiQuery(service.getContacts);
  const conversationsQuery = useApiQuery(service.getConversations);
  // The transcript dates when each of a contact's conversations started.
  const messagesQuery = useApiQuery(service.getMessages);
  // @cpt-end:cpt-template-inbox-flow-contacts-browse-directory:p1:inst-read-collections

  // @cpt-begin:cpt-template-inbox-flow-contacts-browse-directory:p1:inst-read-directory-state
  const filter = useAppSelector((state) => selectContactsDirectory(state).filter);
  const search = useAppSelector((state) => selectContactsDirectory(state).search);
  // @cpt-end:cpt-template-inbox-flow-contacts-browse-directory:p1:inst-read-directory-state

  const filterSidebar = useSidebarToggle();

  // @cpt-begin:cpt-template-inbox-flow-contacts-browse-directory:p1:inst-select-visible
  const contacts = useMemo(() => contactsQuery.data?.contacts ?? [], [contactsQuery.data]);
  const visibleContacts = useMemo(
    () => selectContacts(contacts, filter, search),
    [contacts, filter, search]
  );
  // @cpt-end:cpt-template-inbox-flow-contacts-browse-directory:p1:inst-select-visible

  // @cpt-begin:cpt-template-inbox-flow-contacts-browse-directory:p1:inst-open-contact
  const viewContact = useCallback(
    (contactId: string) => {
      navigation.openContact(contactId);
    },
    [navigation]
  );
  // @cpt-end:cpt-template-inbox-flow-contacts-browse-directory:p1:inst-open-contact

  // The screen's own router moves back to the directory, which stayed mounted
  // behind the person's page and comes back as it was left. The directory
  // takes the person's page's place in the history (`openDirectory`), so the
  // browser's Back never returns to it; the screen never steps through it.
  // @cpt-begin:cpt-template-inbox-flow-contacts-open-person-page:p1:inst-back-to-directory
  const backToDirectory = () => {
    navigation.openDirectory();
  };
  // @cpt-end:cpt-template-inbox-flow-contacts-open-person-page:p1:inst-back-to-directory

  const conversationStartedAt = useMemo(
    () => conversationStarts(messagesQuery.data?.messages ?? []),
    [messagesQuery.data]
  );

  // The transcript only dates the timeline, which falls back to each
  // conversation's last activity without it, so a failed or slow transcript
  // never holds the directory back.
  // @cpt-begin:cpt-template-inbox-flow-contacts-browse-directory:p1:inst-gate-first-paint
  const firstPaint = firstPaintOf([contactsQuery, conversationsQuery]);
  if (firstPaint.failed) return <LoadErrorPane onRetry={firstPaint.retry} t={t} />;
  if (firstPaint.loading) return <LoadingPane />;
  // @cpt-end:cpt-template-inbox-flow-contacts-browse-directory:p1:inst-gate-first-paint

  // @cpt-begin:cpt-template-inbox-flow-contacts-open-person-page:p1:inst-find-contact
  const openContact = contacts.find((contact) => contact.id === openContactId) ?? null;
  // @cpt-end:cpt-template-inbox-flow-contacts-open-person-page:p1:inst-find-contact

  // @cpt-begin:cpt-template-inbox-flow-contacts-open-person-page:p1:inst-join-conversations
  const conversationsById = new Map(
    (conversationsQuery.data?.conversations ?? []).map((conversation) => [conversation.id, conversation])
  );
  const openContactConversations = (openContact?.conversations ?? []).flatMap((ref) => {
    const conversation = conversationsById.get(ref.id);
    return conversation ? [conversation] : [];
  });
  // @cpt-end:cpt-template-inbox-flow-contacts-open-person-page:p1:inst-join-conversations

  const showingDirectory = openContactId === null;

  return (
    <>
      {/*
        The directory stays mounted while a contact page is open, hidden, so
        Back returns to the same filter, search, sort order and page. The
        filter column belongs to the directory, not to one person, so it
        hides with it and the contact page gets the whole width.
      */}
      <ContactFilterSidebar
        contacts={contacts}
        selectedFilter={filter}
        onSelectFilter={(nextFilter) => {
          // @cpt-begin:cpt-template-inbox-flow-contacts-browse-directory:p1:inst-select-filter
          contactsActions.setFilter(nextFilter);
          filterSidebar.dismiss();
          // @cpt-end:cpt-template-inbox-flow-contacts-browse-directory:p1:inst-select-filter
        }}
        column={filterSidebar}
        hidden={!showingDirectory}
        t={t}
      />
      <PagePane hidden={!showingDirectory}>
        <PagePaneHeader
          leading={
            // The kit's large size: the header row also holds the search field, and the controls of one row share its 40px height.
            <Button
              variant="ghost"
              size="lg"
              icon={<PanelLeftIcon />}
              aria-label={t('toggle_contact_filters')}
              aria-expanded={!filterSidebar.collapsed}
              onClick={filterSidebar.toggle}
            />
          }
          heading={
            // Behind a contact page the directory is hidden and the contact's name is the page's h1; the title stays text so the markup holds one h1.
            <Heading size="heading-2" render={showingDirectory ? <ScreenHeading /> : <span />}>
              {t('all_contacts')}
            </Heading>
          }
          subheading={
            <Text variant="meta" tone="muted" render={<span />}>
              {t('people_count', { count: visibleContacts.length })}
            </Text>
          }
          search={
            <>
              {/* @cpt-begin:cpt-template-inbox-flow-contacts-browse-directory:p1:inst-search */}
              <Input
                type="search"
                value={search}
                onValueChange={contactsActions.setSearch}
                placeholder={t('search_contacts')}
                icon={<SearchIcon />}
                aria-label={t('search_contacts')}
              />
              {/* @cpt-end:cpt-template-inbox-flow-contacts-browse-directory:p1:inst-search */}
            </>
          }
        />
        <PagePaneBody>
          {/* @cpt-begin:cpt-template-inbox-flow-contacts-browse-directory:p1:inst-render-table */}
          <ContactsTable contacts={visibleContacts} onViewContact={viewContact} t={t} />
          {/* @cpt-end:cpt-template-inbox-flow-contacts-browse-directory:p1:inst-render-table */}
        </PagePaneBody>
      </PagePane>

      {/* @cpt-begin:cpt-template-inbox-flow-contacts-open-person-page:p1:inst-render-person-page */}
      {openContact ? (
        <ContactDetail
          contact={openContact}
          conversations={openContactConversations}
          conversationStartedAt={conversationStartedAt}
          onBack={backToDirectory}
          t={t}
        />
      ) : null}
      {/* @cpt-end:cpt-template-inbox-flow-contacts-open-person-page:p1:inst-render-person-page */}

      {/* An address naming a contact the directory does not hold says so,
          rather than quietly showing the directory as if no one had been
          asked for. */}
      {/* @cpt-begin:cpt-template-inbox-flow-contacts-open-person-page:p1:inst-not-found */}
      {!showingDirectory && openContact === null ? (
        <PaneState>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserXIcon />
              </EmptyMedia>
              <EmptyTitle render={<ScreenHeading />}>{t('contact_not_found_title')}</EmptyTitle>
              <EmptyDescription>{t('contact_not_found_description')}</EmptyDescription>
            </EmptyHeader>
            <EmptyActions>
              <Button variant="outline" size="sm" onClick={navigation.openDirectory}>
                {t('back_to_contacts')}
              </Button>
            </EmptyActions>
          </Empty>
        </PaneState>
      ) : null}
      {/* @cpt-end:cpt-template-inbox-flow-contacts-open-person-page:p1:inst-not-found */}
    </>
  );
}
