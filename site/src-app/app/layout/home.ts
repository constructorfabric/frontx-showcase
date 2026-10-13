/**
 * The site's home screen, named once in the repository's `site.config.json`. The shell opens it at the bare address and the brand links to it; the build-time head-sync reads the same key and gives the bare address the home page's head, so the dev server and a production build agree.
 *
 * Vite resolves the file through its workspace root (the repository root declares `workspaces`), which is inside the dev server's allowed paths.
 */
import { parseGrammar } from '@gears-frontx/routing';
import siteConfig from '../../../../site.config.json';

/** The route token (`home` for the extension route `/home`) of the home screen. */
// @cpt-begin:cpt-site-algo-shell-layout-navigation-site-choices:p1:inst-read-config
export const HOME_SCREEN_TOKEN: string = siteConfig.homeScreen;
// @cpt-end:cpt-site-algo-shell-layout-navigation-site-choices:p1:inst-read-config

/**
 * Whether an address carries an entry of the given domain. The screen container opens the home screen only at an address without one: the framework's route status of a domain counts entries only once the domain's slot has attached its observer, so right after bootstrap it reads zero for every address, and a deep link would be replaced by the home screen (DESIGN gap G37).
 * @param location - the address as the shell app's navigation facade reads it (`app.mfeRouter.navigation().location()`)
 * @param domainKey - the domain's URL key (`screenDomain.route`)
 */
// @cpt-flow:cpt-site-flow-shell-layout-navigation-open-home:p1
export function addressNamesDomain(location: { pathname: string; search: string }, domainKey: string): boolean {
  // @cpt-begin:cpt-site-flow-shell-layout-navigation-open-home:p1:inst-if-address-names-screen
  const { entries } = parseGrammar({ shellSubroute: location.pathname, search: location.search.replace(/^\?/, ''), hash: undefined });
  return entries.some((entry) => entry.domainKey === domainKey);
  // @cpt-end:cpt-site-flow-shell-layout-navigation-open-home:p1:inst-if-address-names-screen
}
