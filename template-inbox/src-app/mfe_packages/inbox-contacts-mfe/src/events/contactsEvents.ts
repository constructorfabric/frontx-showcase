/**
 * The contacts directory's events: what the visitor did, emitted by `actions/contactsActions.ts` and turned into slice updates by `effects/contactsEffects.ts`. Names follow `mfe/<domain>/<event>` in the past tense.
 */
import type { ContactFilter } from '../screens/contacts/contactFilters';

export {};

declare module '@gears-frontx/react' {
  interface EventPayloadMap {
    'mfe/inbox-contacts/filter-selected': { filter: ContactFilter };
    'mfe/inbox-contacts/search-changed': { search: string };
  }
}
