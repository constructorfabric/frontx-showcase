import { Link, Outlet, useRouterState } from '@gears-frontx/routing-tanstack';
import { SiteLink } from '@site-shared/navigation/SiteLink';
import { SITE_SCREEN_EXTENSIONS } from '@site-shared/navigation/siteScreens';
import type { DocsNav, DocsNavItem } from '@gears-frontx/site-blocks/DocsFrame';
import { useScreenTranslations } from '../../shared/useScreenTranslations';
import { useBridge } from '../../shared/ScreenFrame';

// Hoisted to module level: a new map per render would reload the translations on every render.
const languageModules = import.meta.glob('./i18n/*.json') as Record<string, () => Promise<{ default: Record<string, string> }>>;

// @cpt-begin:cpt-template-site-algo-docs-screen-tab-bar:p1:inst-page-tabs
const TABS = [
  { to: '/', key: 'tabs.overview' },
  { to: '/get-started', key: 'tabs.getStarted' },
  { to: '/first-change', key: 'tabs.firstChange' },
] as const;
// @cpt-end:cpt-template-site-algo-docs-screen-tab-bar:p1:inst-page-tabs

/** The tab bar across the three docs pages, then a tab that opens the libs screen, as the docs frame's navigation. A docs tab is an in-screen link, current when the router matched its route: the link's own active state compares the tab's path with the whole page address, which never equals a screen's root path. */
// @cpt-algo:cpt-template-site-algo-docs-screen-tab-bar:p1
export function useDocsTabs(): DocsNav | undefined {
  // @cpt-begin:cpt-template-site-algo-docs-screen-tab-bar:p1:inst-load-strings
  const bridge = useBridge();
  const { t, loading } = useScreenTranslations(languageModules, bridge);
  // @cpt-end:cpt-template-site-algo-docs-screen-tab-bar:p1:inst-load-strings
  // @cpt-begin:cpt-template-site-algo-docs-screen-tab-bar:p1:inst-current-route
  const current = useRouterState({ select: (state): string | undefined => state.matches[state.matches.length - 1]?.routeId });
  // @cpt-end:cpt-template-site-algo-docs-screen-tab-bar:p1:inst-current-route
  // @cpt-begin:cpt-template-site-algo-docs-screen-tab-bar:p1:inst-if-loading
  if (loading) return undefined;
  // @cpt-end:cpt-template-site-algo-docs-screen-tab-bar:p1:inst-if-loading
  const items: DocsNavItem[] = [
    // @cpt-begin:cpt-template-site-algo-docs-screen-tab-bar:p1:inst-page-tabs
    ...TABS.map((tab): DocsNavItem => ({ id: tab.key, label: t(tab.key), current: current === tab.to, render: <Link to={tab.to} data-testid={`docs-tab-${tab.key}`} /> })),
    // @cpt-end:cpt-template-site-algo-docs-screen-tab-bar:p1:inst-page-tabs
    // @cpt-begin:cpt-template-site-algo-docs-screen-tab-bar:p1:inst-libraries-tab
    { id: 'tabs.libraries', label: t('tabs.libraries'), current: false, render: <SiteLink to={{ extension: SITE_SCREEN_EXTENSIONS.libs }} bridge={bridge} data-testid="docs-tab-tabs.libraries" /> },
    // @cpt-end:cpt-template-site-algo-docs-screen-tab-bar:p1:inst-libraries-tab
  ];
  // @cpt-begin:cpt-template-site-algo-docs-screen-tab-bar:p1:inst-return-tab-bar
  return { label: t('tabs.label'), items };
  // @cpt-end:cpt-template-site-algo-docs-screen-tab-bar:p1:inst-return-tab-bar
}

/** The screen's layout route: the pages render in it. */
// @cpt-begin:cpt-template-site-flow-docs-screen-read-page:p1:inst-build-routes
export function DocsLayout() {
  return <Outlet />;
}
// @cpt-end:cpt-template-site-flow-docs-screen-read-page:p1:inst-build-routes
