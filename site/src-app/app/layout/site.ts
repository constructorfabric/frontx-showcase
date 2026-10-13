/**
 * The site-wide choices the layout reads from the repository's `site.config.json`, next to `homeScreen` (see `home.ts`): the languages the whole site ships, the screens the footer links to, the screens whose footer takes the ink variant and the screen groups the header leaves out. Both are route tokens or language codes, so the layout still names no screen and no language itself.
 */
import siteConfig from '../../../../site.config.json';

/** The language codes every part of the site (the shell's layout strings and every screen) ships strings for. `scripts/site-languages.test.mjs` holds the list to the locale files that exist. */
// @cpt-begin:cpt-site-algo-shell-layout-navigation-site-choices:p1:inst-read-config
export const SITE_LANGUAGES: readonly string[] = siteConfig.languages;

/** The route tokens of the screens the footer links to, in order. */
export const FOOTER_SCREENS: readonly string[] = siteConfig.footerScreens;

/** The route tokens of the screens whose footer takes the ink variant (V2's showcase footer). */
export const INK_FOOTER_SCREENS: readonly string[] = siteConfig.inkFooterScreens;

/** The nav group names whose screens the header's menu does not list; the screens stay registered and reachable by address. The site hides none. */
export const HEADER_HIDDEN_GROUPS: readonly string[] = siteConfig.headerHiddenGroups;
// @cpt-end:cpt-site-algo-shell-layout-navigation-site-choices:p1:inst-read-config

/**
 * The language options the header offers: the framework's supported languages the site ships, in the site's order. A code the framework does not support is dropped, since the i18n registry could not switch to it.
 * @param supported - the framework's `SUPPORTED_LANGUAGES`
 * @param shipped - the site's languages
 */
// @cpt-algo:cpt-site-algo-shell-layout-navigation-site-choices:p1
export function offeredLanguages<T extends { code: string }>(supported: readonly T[], shipped: readonly string[]): T[] {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-site-choices:p1:inst-offered-languages
  return shipped.flatMap((code) => supported.filter((language) => language.code === code));
  // @cpt-end:cpt-site-algo-shell-layout-navigation-site-choices:p1:inst-offered-languages
}
