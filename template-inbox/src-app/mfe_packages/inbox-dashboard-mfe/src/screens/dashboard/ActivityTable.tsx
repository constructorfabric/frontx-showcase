import { useMemo } from 'react';
import { CalendarDaysIcon, CircleDotIcon, ContactIcon, SearchIcon, TagIcon, UserRoundIcon } from 'lucide-react';
import {
  Badge,
  DataTable,
  DataTableSortButton,
  dataTableColumnHelper,
  Input,
} from '@gears-frontx/ui-kit';
import type { ActivityKind, ActivityStatus } from '@inbox-shared/api/dashboardTypes';
import type { Translate } from '@inbox-shared/i18n/translate';
import { labelOf, longRelativeTime, orDash } from '@inbox-shared/ui/format';
import { IdentityAvatar } from '@inbox-shared/ui/IdentityAvatar';
import { PresenceAvatar } from '@inbox-shared/blocks/PresenceAvatar';
import type { ActivityRow } from './dashboardSelectors';
import { DataTableHeaderLabel, DataTableIdentityCell, DataTableSection } from '@inbox-shared/blocks/DataTableSection';

export type ActivityTableProps = {
  /** The rows `resolvedActivity` keeps, the same list the summary counts. */
  rows: ActivityRow[];
  t: Translate;
};

const KIND_TONE: Record<ActivityKind, 'info' | 'accent' | 'secondary'> = {
  chat: 'info',
  mail: 'accent',
  task: 'secondary',
};

/*
 * Only badge variants whose text keeps 4.5:1 in both themes: the kit's
 * `warning`, `success` and `danger` badges do not in the light theme (a kit
 * defect `deltaTone` describes). The label spells the status out; the
 * variant only sets the four statuses apart.
 */
const STATUS_TONE: Record<ActivityStatus, 'info' | 'outline' | 'secondary' | 'default'> = {
  open: 'info',
  pending: 'outline',
  resolved: 'secondary',
  escalated: 'default',
};

/**
 * Row 6's full-width table: a contact cell reusing the same identity data
 * the Contacts screen shows (avatar, name, company) so a person appearing
 * here reads as the same person there, plus the kind/status/owner/date
 * columns. Sorting and pagination come for free from the
 * kit's `DataTable`.
 *
 * Header dressing (per-column lucide icon, a live row count, an inert
 * search field) is the usual CRM activity-table header, built at template
 * level only, through `DataTable`'s own composition points (`header` render
 * functions) and the `DataTableSection` block, no kit changes. The search field carries no handler: this template does
 * no activity filtering, so it renders disabled rather than silently doing
 * nothing - the app's convention for a control with no action behind it
 * (the rail's profile entries, the thread header's create-ticket button).
 */
export function ActivityTable({ rows, t }: ActivityTableProps) {
  const columns = useMemo(() => {
    const column = dataTableColumnHelper<ActivityRow>();
    return column.columns([
      column.accessor((row) => row.contact.name, {
        id: 'contact',
        header: ({ column: instance }) => (
          <DataTableSortButton column={instance}>
            <DataTableHeaderLabel icon={<ContactIcon aria-hidden="true" />}>{t('contact')}</DataTableHeaderLabel>
          </DataTableSortButton>
        ),
        cell: ({ row }) => (
          <DataTableIdentityCell
            avatar={<PresenceAvatar name={row.original.contact.name} presence={row.original.contact.presence} size="sm" t={t} />}
            name={row.original.contact.name}
            description={orDash(row.original.contact.company)}
          />
        ),
      }),
      column.accessor('kind', {
        header: ({ column: instance }) => (
          <DataTableSortButton column={instance}>
            <DataTableHeaderLabel icon={<TagIcon aria-hidden="true" />}>{t('kind')}</DataTableHeaderLabel>
          </DataTableSortButton>
        ),
        cell: ({ getValue }) => <Badge variant={KIND_TONE[getValue()]}>{labelOf(getValue(), t)}</Badge>,
      }),
      column.accessor('status', {
        header: ({ column: instance }) => (
          <DataTableSortButton column={instance}>
            <DataTableHeaderLabel icon={<CircleDotIcon aria-hidden="true" />}>{t('status')}</DataTableHeaderLabel>
          </DataTableSortButton>
        ),
        cell: ({ getValue }) => <Badge variant={STATUS_TONE[getValue()]}>{labelOf(getValue(), t)}</Badge>,
      }),
      column.accessor('ownerName', {
        header: ({ column: instance }) => (
          <DataTableSortButton column={instance}>
            <DataTableHeaderLabel icon={<UserRoundIcon aria-hidden="true" />}>{t('owner')}</DataTableHeaderLabel>
          </DataTableSortButton>
        ),
        cell: ({ getValue }) => {
          const name = getValue();
          return <DataTableIdentityCell avatar={<IdentityAvatar name={name} size="sm" />} name={name} />;
        },
      }),
      column.accessor('occurredAt', {
        header: ({ column: instance }) => (
          <DataTableSortButton column={instance}>
            <DataTableHeaderLabel icon={<CalendarDaysIcon aria-hidden="true" />}>{t('date')}</DataTableHeaderLabel>
          </DataTableSortButton>
        ),
        cell: ({ getValue }) => longRelativeTime(getValue(), t),
      }),
    ]);
  }, [t]);

  return (
    <DataTableSection
      title={t('recent_activity')}
      count={String(rows.length)}
      search={
        <Input
          type="search"
          icon={<SearchIcon />}
          placeholder={t('search_activity')}
          disabled
          aria-label={t('search_activity')}
        />
      }
    >
      <DataTable
        columns={columns}
        data={rows}
        emptyMessage={t('no_activity')}
        previousLabel={t('previous_page')}
        nextLabel={t('next_page')}
      />
    </DataTableSection>
  );
}
