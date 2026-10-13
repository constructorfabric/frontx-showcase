import { apiRegistry, useApiQuery } from '@gears-frontx/react';
import { OutlinePage, type OutlineChrome } from '@site-shared/content/OutlinePage';
import { PageError, PageLoading } from '@site-shared/content/PageStates';
import { Boxes, PanelsTopLeft, Route } from 'lucide-react';
import type { Href, Page } from '@site-shared/content/outline';
import { twinPath } from '@site-shared/content/twins';
import { LibsApiService } from '../../api/LibsApiService';
import { useScreenTranslations } from '../../shared/useScreenTranslations';
import { useBridge } from '../../shared/ScreenFrame';
import { LibraryList } from './LibraryList';
import { useLibsTabs } from './LibsLayout';

// Hoisted to module level: a new map per render would reload the translations on every render.
const languageModules = import.meta.glob('./i18n/*.json') as Record<string, () => Promise<{ default: Record<string, string> }>>;

// @cpt-begin:cpt-template-site-flow-libraries-screen-read-page:p1:inst-render-page
/** The screen's route token, the first segment of its twins' paths. */
const SCREEN = 'libs';
// @cpt-end:cpt-template-site-flow-libraries-screen-read-page:p1:inst-render-page

/** The icon of a summary card, by the summary it opens. */
// @cpt-algo:cpt-template-site-algo-libraries-screen-card-icon:p2
function cardIcon(target: Href) {
  // @cpt-begin:cpt-template-site-algo-libraries-screen-card-icon:p2:inst-no-route
  if (!('route' in target) || target.route === undefined) return undefined;
  // @cpt-end:cpt-template-site-algo-libraries-screen-card-icon:p2:inst-no-route
  // @cpt-begin:cpt-template-site-algo-libraries-screen-card-icon:p2:inst-summary-icon
  if (target.route === '/routing') return <Route aria-hidden />;
  if (target.route === '/mfes') return <Boxes aria-hidden />;
  if (target.route === '/screen-domain') return <PanelsTopLeft aria-hidden />;
  return undefined;
  // @cpt-end:cpt-template-site-algo-libraries-screen-card-icon:p2:inst-summary-icon
}

export interface LibsPageProps {
  page: Page;
}

/** One libs page: the outline page with the tab bar, its texts filled from the libs data, and a link to its plain-text twin. */
// @cpt-flow:cpt-template-site-flow-libraries-screen-read-page:p1
// @cpt-state:cpt-template-site-state-libraries-screen-page:p2
// @cpt-dod:cpt-template-site-dod-libraries-screen-pages:p1
export function LibsPage({ page }: LibsPageProps) {
  // @cpt-begin:cpt-template-site-flow-libraries-screen-read-page:p1:inst-load-strings
  const bridge = useBridge();
  const { t, loading } = useScreenTranslations(languageModules, bridge);
  // @cpt-end:cpt-template-site-flow-libraries-screen-read-page:p1:inst-load-strings
  // @cpt-begin:cpt-template-site-flow-libraries-screen-read-page:p1:inst-read-libraries
  const data = useApiQuery(apiRegistry.getService(LibsApiService).getLibraries);
  // @cpt-end:cpt-template-site-flow-libraries-screen-read-page:p1:inst-read-libraries
  // @cpt-begin:cpt-template-site-flow-libraries-screen-read-page:p1:inst-render-page
  const nav = useLibsTabs();
  // @cpt-end:cpt-template-site-flow-libraries-screen-read-page:p1:inst-render-page

  // @cpt-begin:cpt-template-site-flow-libraries-screen-read-page:p1:inst-if-loading
  // @cpt-begin:cpt-template-site-flow-libraries-screen-read-page:p1:inst-return-loading
  if (loading || data.isLoading) return <PageLoading label={loading ? undefined : t('loading')} />;
  // @cpt-end:cpt-template-site-flow-libraries-screen-read-page:p1:inst-return-loading
  // @cpt-end:cpt-template-site-flow-libraries-screen-read-page:p1:inst-if-loading
  // @cpt-begin:cpt-template-site-flow-libraries-screen-read-page:p1:inst-if-error
  // @cpt-begin:cpt-template-site-flow-libraries-screen-read-page:p1:inst-return-error
  // @cpt-begin:cpt-template-site-state-libraries-screen-page:p2:inst-to-failed
  if (data.isError || !data.data) return <PageError message={t('error')} />;
  // @cpt-end:cpt-template-site-state-libraries-screen-page:p2:inst-to-failed
  // @cpt-end:cpt-template-site-flow-libraries-screen-read-page:p1:inst-return-error
  // @cpt-end:cpt-template-site-flow-libraries-screen-read-page:p1:inst-if-error

  // @cpt-begin:cpt-template-site-flow-libraries-screen-read-page:p1:inst-chrome-labels
  const chrome: OutlineChrome = {
    copy: t('chrome.copy'),
    copied: t('chrome.copied'),
    onThisPage: t('chrome.onThisPage'),
    expected: t('chrome.expected'),
    lines: t('chrome.lines'),
    plainText: t('chrome.plainText'),
    code: t('chrome.code'),
    files: t('chrome.files'),
    example: t('chrome.example'),
    keyFiles: t('chrome.keyFiles'),
    findFile: t('chrome.findFile'),
    noFiles: t('chrome.noFiles'),
    github: t('chrome.github'),
    includedScreens: t('chrome.includedScreens'),
    templateRoot: t('chrome.templateRoot'),
  };
  const { libraries, shellPackages } = data.data;
  // @cpt-end:cpt-template-site-flow-libraries-screen-read-page:p1:inst-chrome-labels

  // @cpt-begin:cpt-template-site-flow-libraries-screen-read-page:p1:inst-render-page
  // @cpt-begin:cpt-template-site-state-libraries-screen-page:p2:inst-to-shown
  return (
    <OutlinePage
      page={page}
      translate={t}
      vars={data.data.vars}
      bridge={bridge}
      chrome={chrome}
      nav={nav}
      twinHref={twinPath(SCREEN, page.route)}
      screen={SCREEN}
      cardArt={cardIcon}
      rail={page.route !== '/'}
      renderData={(entry) => (entry.type === 'package-list' ? <LibraryList libraries={libraries} shellPackages={shellPackages} t={t} chrome={chrome} bridge={bridge} /> : null)}
    />
  );
  // @cpt-end:cpt-template-site-state-libraries-screen-page:p2:inst-to-shown
  // @cpt-end:cpt-template-site-flow-libraries-screen-read-page:p1:inst-render-page
}
