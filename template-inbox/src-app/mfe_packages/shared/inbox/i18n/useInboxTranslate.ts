import { useMemo } from 'react';
import { FRONTX_SHARED_PROPERTY_LANGUAGE, type ChildMfeBridge } from '@gears-frontx/react';
import { useBridgeProperty } from '../lifecycle/useBridgeProperty';
import { createTranslate, locale, type Translate } from './translate';

/** A catalogue per language code (`en`, `de`, ...), as a screen's own `src/screens/<screen>/i18n/<lang>.json` files provide them. */
export type InboxCatalogues = Readonly<Record<string, Readonly<Record<string, string>>>>;

/**
 * Catalogues by language code from the `<lang>.json` files of one folder, as `import.meta.glob('./*.json', { eager: true, import: 'default' })` returns them: a new language is a new file, named nowhere else.
 * @param files - Each file's path and its parsed catalogue
 */
export function cataloguesFromFiles(files: Readonly<Record<string, Readonly<Record<string, string>>>>): InboxCatalogues {
  // @cpt-begin:cpt-template-inbox-algo-screen-frame-translate:p1:inst-catalogues-from-files
  return Object.fromEntries(Object.entries(files).map(([file, catalogue]) => [file.replace(/^.*\//, '').replace(/\.json$/, ''), catalogue]));
  // @cpt-end:cpt-template-inbox-algo-screen-frame-translate:p1:inst-catalogues-from-files
}

/** The shared components' catalogues: every `<lang>.json` beside this module. Only `en` ships. */
// @cpt-begin:cpt-template-inbox-algo-screen-frame-translate:p1:inst-catalogues-from-files
export const SHARED_CATALOGUES: InboxCatalogues = cataloguesFromFiles(import.meta.glob<Readonly<Record<string, string>>>('./*.json', { eager: true, import: 'default' }));
// @cpt-end:cpt-template-inbox-algo-screen-frame-translate:p1:inst-catalogues-from-files

/** The language every catalogue is complete in, and the one an unknown language falls back to. */
export const FALLBACK_LANGUAGE = 'en';

/**
 * The shared catalogue with the package's own merged over it, for `language`,
 * or for `en` when either layer has no catalogue in that language. Falling
 * back as a whole rather than key by key keeps a screen in one language: a
 * half-translated screen reads as a bug, an English one as a missing
 * translation.
 *
 * @param language - The shell's language code
 * @param packageCatalogues - The package's own catalogues
 * @param sharedCatalogues - The shared components' catalogues
 */
export function catalogueFor(
  language: string,
  packageCatalogues: InboxCatalogues,
  sharedCatalogues: InboxCatalogues = SHARED_CATALOGUES
): Readonly<Record<string, string>> {
  // @cpt-begin:cpt-template-inbox-algo-screen-frame-translate:p1:inst-choose-catalogue
  const known = sharedCatalogues[language] !== undefined && packageCatalogues[language] !== undefined;
  const chosen = known ? language : FALLBACK_LANGUAGE;
  return { ...sharedCatalogues[chosen], ...packageCatalogues[chosen] };
  // @cpt-end:cpt-template-inbox-algo-screen-frame-translate:p1:inst-choose-catalogue
}

/**
 * The translator for the language the shell publishes, rebuilt when the shell
 * switches language. `locale` stays the shipped catalogue's (`en-US`) while
 * `en` is the only catalogue: a formatter writing German dates beside English
 * words would read worse than either.
 *
 * @param bridge - The screen's bridge, read for the shared language property
 * @param packageCatalogues - The package's own catalogues, by language code
 * @param sharedCatalogues - The shared components' catalogues (every `<lang>.json` beside this module)
 */
// @cpt-algo:cpt-template-inbox-algo-screen-frame-translate:p1
// @cpt-dod:cpt-template-inbox-dod-screen-frame-translations:p1
export function useInboxTranslate(
  bridge: ChildMfeBridge,
  packageCatalogues: InboxCatalogues,
  sharedCatalogues: InboxCatalogues = SHARED_CATALOGUES
): Translate {
  // @cpt-begin:cpt-template-inbox-algo-screen-frame-translate:p1:inst-read-language
  const language = useBridgeProperty<unknown>(bridge, FRONTX_SHARED_PROPERTY_LANGUAGE, FALLBACK_LANGUAGE);
  const code = typeof language === 'string' ? language : FALLBACK_LANGUAGE;
  // @cpt-end:cpt-template-inbox-algo-screen-frame-translate:p1:inst-read-language
  // @cpt-begin:cpt-template-inbox-algo-screen-frame-translate:p1:inst-build-translate
  return useMemo(() => createTranslate(catalogueFor(code, packageCatalogues, sharedCatalogues), locale), [code, packageCatalogues, sharedCatalogues]);
  // @cpt-end:cpt-template-inbox-algo-screen-frame-translate:p1:inst-build-translate
}
