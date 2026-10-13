import type { ContactType } from '@inbox-shared/api/types';

/**
 * The badge variant of a contact type. Only variants whose text keeps 4.5:1 in both themes: the kit's `warning` badge a lead used to wear reads at 1.99:1 in the light theme (a kit defect). The label names the type; the variant sets the two apart.
 */
export const CONTACT_TYPE_BADGE: Record<ContactType, 'outline' | 'info'> = {
  lead: 'outline',
  user: 'info',
};
