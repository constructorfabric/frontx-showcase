import { useMemo } from 'react';
import { EyeIcon } from 'lucide-react';
import {
  Badge,
  Button,
  DataTable,
  DataTableSortButton,
  dataTableColumnHelper,
  dataTableSelectionColumn,
} from '@gears-frontx/ui-kit';
import { VisuallyHidden } from '@gears-frontx/kit-candidates';
import type { Contact } from '@inbox-shared/api/types';
import { emailDomain, labelOf, longRelativeTime, orDash } from '@inbox-shared/ui/format';
import type { Translate } from '@inbox-shared/i18n/translate';
import { PresenceAvatar } from '@inbox-shared/blocks/PresenceAvatar';
import { CellActions } from '@inbox-shared/blocks/CellActions';
import { DataTableIdentityCell } from '@inbox-shared/blocks/DataTableSection';
import { CONTACT_TYPE_BADGE } from './contactTypeBadge';

/** 25 rows a page: the 29 seeded contacts span two pages. */
const ROWS_PER_PAGE = 25;

export type ContactsTableProps = {
  contacts: Contact[];
  onViewContact: (contactId: string) => void;
  t: Translate;
};

export function ContactsTable({ contacts, onViewContact, t }: ContactsTableProps) {
  // Rebuilt only when the labels or the row action change: a fresh `columns`
  // array on every render would reset the table's own sorting and paging
  // state, which is what a data table keeps between renders.
  const columns = useMemo(() => {
    const column = dataTableColumnHelper<Contact>();
    return column.columns([
      dataTableSelectionColumn<Contact>({ selectAllLabel: t('select_all_rows'), selectRowLabel: t('select_row') }),
      column.accessor('name', {
        header: ({ column: instance }) => (
          <DataTableSortButton column={instance}>{t('name')}</DataTableSortButton>
        ),
        cell: ({ row }) => (
          <DataTableIdentityCell
            avatar={<PresenceAvatar name={row.original.name} presence={row.original.presence} size="sm" t={t} />}
            name={row.original.name}
            description={row.original.email}
          />
        ),
      }),
      column.accessor('type', {
        header: ({ column: instance }) => (
          <DataTableSortButton column={instance}>{t('type')}</DataTableSortButton>
        ),
        cell: ({ getValue }) => (
          <Badge variant={CONTACT_TYPE_BADGE[getValue()]}>{labelOf(getValue(), t)}</Badge>
        ),
      }),
      column.accessor('company', {
        header: ({ column: instance }) => (
          <DataTableSortButton column={instance}>{t('company')}</DataTableSortButton>
        ),
        cell: ({ getValue }) => orDash(getValue()),
      }),
      column.accessor((contact) => emailDomain(contact.email), {
        id: 'domain',
        header: ({ column: instance }) => (
          <DataTableSortButton column={instance}>{t('email_domain')}</DataTableSortButton>
        ),
      }),
      column.accessor('location', {
        header: ({ column: instance }) => (
          <DataTableSortButton column={instance}>{t('location')}</DataTableSortButton>
        ),
        cell: ({ getValue }) => orDash(getValue()),
      }),
      column.accessor((contact) => contact.tickets.length, {
        id: 'tickets',
        header: ({ column: instance }) => (
          <DataTableSortButton column={instance}>{t('tickets')}</DataTableSortButton>
        ),
      }),
      column.accessor('lastSeenAt', {
        header: ({ column: instance }) => (
          <DataTableSortButton column={instance}>{t('last_seen')}</DataTableSortButton>
        ),
        cell: ({ getValue }) => longRelativeTime(getValue(), t),
      }),
      column.display({
        id: 'actions',
        // The column holds icon buttons only; its header names it for a screen reader, where an empty header would leave the column unnamed.
        header: () => <VisuallyHidden>{t('actions_column')}</VisuallyHidden>,
        cell: ({ row }) => (
          <CellActions>
            <Button
              variant="ghost"
              size="sm"
              icon={<EyeIcon />}
              aria-label={t('view_contact')}
              onClick={() => onViewContact(row.original.id)}
            />
          </CellActions>
        ),
      }),
    ]);
  }, [onViewContact, t]);

  return (
    <DataTable
      columns={columns}
      data={contacts}
      pageSize={ROWS_PER_PAGE}
      enableRowSelection
      emptyMessage={t('no_contacts')}
      previousLabel={t('previous_page')}
      nextLabel={t('next_page')}
      selectionSummary={(selected, total) => t('rows_selected', { selected, count: total })}
    />
  );
}
