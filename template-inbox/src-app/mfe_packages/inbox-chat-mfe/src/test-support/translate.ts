import { createTranslate, locale } from '@inbox-shared/i18n/translate';
import { catalogueFor } from '@inbox-shared/i18n/useInboxTranslate';
import { chatCatalogues } from '../screens/chat/i18n/catalogues';

/** The translator the frame builds for `en`: the shared catalogue with this screen's merged over it. */
export const t = createTranslate(catalogueFor('en', chatCatalogues), locale);
