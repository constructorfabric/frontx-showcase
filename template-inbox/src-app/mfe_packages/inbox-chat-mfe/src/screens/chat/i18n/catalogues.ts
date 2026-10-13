import { cataloguesFromFiles, type InboxCatalogues } from '@inbox-shared/i18n/useInboxTranslate';

/** This screen's own catalogues, by language code: every `<lang>.json` in this folder. The frame merges them over the shared ones. */
export const chatCatalogues: InboxCatalogues = cataloguesFromFiles(import.meta.glob<Readonly<Record<string, string>>>('./*.json', { eager: true, import: 'default' }));
