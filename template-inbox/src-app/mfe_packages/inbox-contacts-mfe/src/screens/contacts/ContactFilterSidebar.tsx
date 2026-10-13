import type { Contact } from '@inbox-shared/api/types';
import type { Translate } from '@inbox-shared/i18n/translate';
import { NavColumn } from '@inbox-shared/blocks/NavColumn';
import type { SidebarToggle } from '@inbox-shared/ui/useSidebarToggle';
import {
  CONTACT_FILTERS,
  CONTACT_FILTER_LABEL_KEY,
  countForFilter,
  type ContactFilter,
} from './contactFilters';

export type ContactFilterSidebarProps = {
  contacts: Contact[];
  selectedFilter: ContactFilter;
  onSelectFilter: (filter: ContactFilter) => void;
  column: SidebarToggle;
  /** Out of the page entirely (a contact's own page is open), not just folded. */
  hidden?: boolean;
  t: Translate;
};

/** The directory's filters, each with the number of contacts it keeps, in the screen's side column. */
export function ContactFilterSidebar({
  contacts,
  selectedFilter,
  onSelectFilter,
  column,
  hidden = false,
  t,
}: ContactFilterSidebarProps) {
  // @cpt-begin:cpt-template-inbox-flow-contacts-browse-directory:p1:inst-render-filter-counts
  const items = CONTACT_FILTERS.map((filter) => ({
    id: filter,
    label: t(CONTACT_FILTER_LABEL_KEY[filter]),
    count: countForFilter(contacts, filter),
  }));
  // @cpt-end:cpt-template-inbox-flow-contacts-browse-directory:p1:inst-render-filter-counts
  return (
    <NavColumn
      state={column}
      label={t('contact_filters')}
      title={t('contacts')}
      closeLabel={t('close')}
      hidden={hidden}
      items={items}
      selectedId={selectedFilter}
      onSelect={(id) => {
        const filter = CONTACT_FILTERS.find((candidate) => candidate === id);
        if (filter !== undefined) onSelectFilter(filter);
      }}
    />
  );
}
