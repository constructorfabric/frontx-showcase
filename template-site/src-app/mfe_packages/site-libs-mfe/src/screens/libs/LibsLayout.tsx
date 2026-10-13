import { Link, Outlet, useRouterState } from '@gears-frontx/routing-tanstack';
import { useScreenTranslations } from '../../shared/useScreenTranslations';
import { useBridge } from '../../shared/ScreenFrame';
import type { DocsNav } from '@gears-frontx/site-blocks/DocsFrame';

// Hoisted to module level: a new map per render would reload the translations on every render.
const languageModules = import.meta.glob('./i18n/*.json') as Record<string, () => Promise<{ default: Record<string, string> }>>;

// @cpt-begin:cpt-template-site-algo-libraries-screen-tab-bar:p2:inst-page-tabs
const TABS = [
  { to: '/', key: 'tabs.libraries' },
  { to: '/routing', key: 'tabs.routing' },
  { to: '/mfes', key: 'tabs.mfes' },
  { to: '/screen-domain', key: 'tabs.screenDomain' },
] as const;
// @cpt-end:cpt-template-site-algo-libraries-screen-tab-bar:p2:inst-page-tabs

/** The tab bar across the four libs pages, as the docs frame's navigation; each tab is an in-screen link. The current tab is the one whose route the router matched: the link's own active state compares the tab's path with the whole page address, which never equals a screen's root path. */
// @cpt-algo:cpt-template-site-algo-libraries-screen-tab-bar:p2
export function useLibsTabs(): DocsNav | undefined {
  // @cpt-begin:cpt-template-site-algo-libraries-screen-tab-bar:p2:inst-load-strings
  const { t, loading } = useScreenTranslations(languageModules, useBridge());
  // @cpt-end:cpt-template-site-algo-libraries-screen-tab-bar:p2:inst-load-strings
  // @cpt-begin:cpt-template-site-algo-libraries-screen-tab-bar:p2:inst-current-route
  const current = useRouterState({ select: (state): string | undefined => state.matches[state.matches.length - 1]?.routeId });
  // @cpt-end:cpt-template-site-algo-libraries-screen-tab-bar:p2:inst-current-route
  // @cpt-begin:cpt-template-site-algo-libraries-screen-tab-bar:p2:inst-if-loading
  if (loading) return undefined;
  // @cpt-end:cpt-template-site-algo-libraries-screen-tab-bar:p2:inst-if-loading
  // @cpt-begin:cpt-template-site-algo-libraries-screen-tab-bar:p2:inst-page-tabs
  return { label: t('tabs.label'), items: TABS.map((tab) => ({ id: tab.key, label: t(tab.key), current: current === tab.to, render: <Link to={tab.to} data-testid={`libs-tab-${tab.key}`} /> })) };
  // @cpt-end:cpt-template-site-algo-libraries-screen-tab-bar:p2:inst-page-tabs
}

/** The screen's layout route: the pages render in it. */
// @cpt-begin:cpt-template-site-flow-libraries-screen-read-page:p1:inst-build-routes
export function LibsLayout() {
  return <Outlet />;
}
// @cpt-end:cpt-template-site-flow-libraries-screen-read-page:p1:inst-build-routes
