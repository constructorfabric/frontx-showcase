/**
 * The shell layout's own strings, registered with the FrontX i18n registry under the `layout` namespace (the way the studio registers `studio`).
 *
 * English is the source locale and the only file. The registry loads a namespace for the current language only and looks up the fallback language in what it has loaded, so a loader that refused other languages would leave the keys on screen after a language switch; this one answers every language with the English strings until a locale file exists for it.
 */
import { i18nRegistry, type TranslationLoader } from '@gears-frontx/react';

// @cpt-algo:cpt-site-algo-shell-layout-navigation-look-and-strings:p1
// @cpt-begin:cpt-site-algo-shell-layout-navigation-look-and-strings:p1:inst-register-strings
export const LAYOUT_NAMESPACE = 'layout';

const loadLayoutStrings: TranslationLoader = async () => (await import('./i18n/en.json')).default;

i18nRegistry.registerLoader(LAYOUT_NAMESPACE, loadLayoutStrings);
// @cpt-end:cpt-site-algo-shell-layout-navigation-look-and-strings:p1:inst-register-strings

/** A key of the layout namespace, in the form `useTranslation().t` reads. */
export const layoutKey = (key: string): string => `${LAYOUT_NAMESPACE}:${key}`;
