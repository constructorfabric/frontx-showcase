import { apiRegistry, useApiQuery } from '@gears-frontx/react';
import { Blocks, Braces, FilePenLine, Plus, Terminal } from 'lucide-react';
import { OutlinePage, type OutlineChrome } from '@site-shared/content/OutlinePage';
import { PageError, PageLoading } from '@site-shared/content/PageStates';
import type { Href, Page } from '@site-shared/content/outline';
import { twinPath } from '@site-shared/content/twins';
import { SITE_SCREEN_EXTENSIONS } from '@site-shared/navigation/siteScreens';
import { DocsApiService } from '../../api/DocsApiService';
import { useScreenTranslations } from '../../shared/useScreenTranslations';
import { useBridge } from '../../shared/ScreenFrame';
import { useDocsTabs } from './DocsLayout';

// Hoisted to module level: a new map per render would reload the translations on every render.
const languageModules = import.meta.glob('./i18n/*.json') as Record<string, () => Promise<{ default: Record<string, string> }>>;

// @cpt-begin:cpt-template-site-flow-docs-screen-read-page:p1:inst-render-page
/** The screen's route token, the first segment of its twins' paths. */
const SCREEN = 'docs';
// @cpt-end:cpt-template-site-flow-docs-screen-read-page:p1:inst-render-page

/** The icon of a docs card, by where it leads: a new project from scratch, the first change, the libraries, the UI kit. */
// @cpt-algo:cpt-template-site-algo-docs-screen-card-icon:p2
function cardIcon(target: Href) {
  // @cpt-begin:cpt-template-site-algo-docs-screen-card-icon:p2:inst-anchor-icon
  if ('anchor' in target) return <Plus aria-hidden />;
  // @cpt-end:cpt-template-site-algo-docs-screen-card-icon:p2:inst-anchor-icon
  // @cpt-begin:cpt-template-site-algo-docs-screen-card-icon:p2:inst-screen-icon
  if ('extension' in target) return target.extension === SITE_SCREEN_EXTENSIONS.libs ? <Braces aria-hidden /> : <Blocks aria-hidden />;
  // @cpt-end:cpt-template-site-algo-docs-screen-card-icon:p2:inst-screen-icon
  // @cpt-begin:cpt-template-site-algo-docs-screen-card-icon:p2:inst-route-icon
  if ('route' in target) return target.route === '/first-change' ? <FilePenLine aria-hidden /> : <Terminal aria-hidden />;
  // @cpt-end:cpt-template-site-algo-docs-screen-card-icon:p2:inst-route-icon
  // @cpt-begin:cpt-template-site-algo-docs-screen-card-icon:p2:inst-no-icon
  return undefined;
  // @cpt-end:cpt-template-site-algo-docs-screen-card-icon:p2:inst-no-icon
}

export interface DocsPageProps {
  page: Page;
}

/** One docs page: the outline page with the tab bar, its commands filled from the docs data, and a link to its plain-text twin. */
// @cpt-flow:cpt-template-site-flow-docs-screen-read-page:p1
// @cpt-state:cpt-template-site-state-docs-screen-page:p2
// @cpt-dod:cpt-template-site-dod-docs-screen-pages:p1
export function DocsPage({ page }: DocsPageProps) {
  // @cpt-begin:cpt-template-site-flow-docs-screen-read-page:p1:inst-load-strings
  const bridge = useBridge();
  const { t, loading } = useScreenTranslations(languageModules, bridge);
  // @cpt-end:cpt-template-site-flow-docs-screen-read-page:p1:inst-load-strings
  // @cpt-begin:cpt-template-site-flow-docs-screen-read-page:p1:inst-read-versions
  const versions = useApiQuery(apiRegistry.getService(DocsApiService).getVersions);
  // @cpt-end:cpt-template-site-flow-docs-screen-read-page:p1:inst-read-versions
  // @cpt-begin:cpt-template-site-flow-docs-screen-read-page:p1:inst-render-page
  const nav = useDocsTabs();
  // @cpt-end:cpt-template-site-flow-docs-screen-read-page:p1:inst-render-page

  // @cpt-begin:cpt-template-site-flow-docs-screen-read-page:p1:inst-if-loading
  // @cpt-begin:cpt-template-site-flow-docs-screen-read-page:p1:inst-return-loading
  if (loading || versions.isLoading) return <PageLoading label={loading ? undefined : t('loading')} />;
  // @cpt-end:cpt-template-site-flow-docs-screen-read-page:p1:inst-return-loading
  // @cpt-end:cpt-template-site-flow-docs-screen-read-page:p1:inst-if-loading
  // @cpt-begin:cpt-template-site-flow-docs-screen-read-page:p1:inst-if-error
  // @cpt-begin:cpt-template-site-flow-docs-screen-read-page:p1:inst-return-error
  // @cpt-begin:cpt-template-site-state-docs-screen-page:p2:inst-to-failed
  if (versions.isError || !versions.data) return <PageError message={t('error')} />;
  // @cpt-end:cpt-template-site-state-docs-screen-page:p2:inst-to-failed
  // @cpt-end:cpt-template-site-flow-docs-screen-read-page:p1:inst-return-error
  // @cpt-end:cpt-template-site-flow-docs-screen-read-page:p1:inst-if-error

  // @cpt-begin:cpt-template-site-flow-docs-screen-read-page:p1:inst-chrome-labels
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
    startPaths: t('chrome.startPaths'),
  };
  // @cpt-end:cpt-template-site-flow-docs-screen-read-page:p1:inst-chrome-labels

  // @cpt-begin:cpt-template-site-flow-docs-screen-read-page:p1:inst-render-page
  // @cpt-begin:cpt-template-site-state-docs-screen-page:p2:inst-to-shown
  return (
    <OutlinePage
      page={page}
      translate={t}
      // The agent task names the site's plain-text guides by their full address, which only the page knows.
      vars={{ ...versions.data.vars, siteOrigin: window.location.origin }}
      bridge={bridge}
      chrome={chrome}
      nav={nav}
      twinHref={twinPath(SCREEN, page.route)}
      screen={SCREEN}
      cardArt={cardIcon}
      rail={page.route !== '/'}
    />
  );
  // @cpt-end:cpt-template-site-state-docs-screen-page:p2:inst-to-shown
  // @cpt-end:cpt-template-site-flow-docs-screen-read-page:p1:inst-render-page
}
