import { apiRegistry, useApiQuery } from '@gears-frontx/react';
import { Boxes, Braces, CalendarDays, Inbox, LayoutTemplate, LibraryBig } from 'lucide-react';
import { OutlinePage, type OutlineChrome } from '@site-shared/content/OutlinePage';
import { pageAt, type Href } from '@site-shared/content/outline';
import { twinPath } from '@site-shared/content/twins';
import { templateArt } from '@site-shared/content/brandArt';
import { PageError, PageLoading } from '@site-shared/content/PageStates';
import { TemplatesApiService } from '../../api/TemplatesApiService';
import { useScreenTranslations } from '../../shared/useScreenTranslations';
import { useBridge } from '../../shared/ScreenFrame';

// Hoisted to module level: a new map per render would reload the translations on every render.
const languageModules = import.meta.glob('./i18n/*.json') as Record<string, () => Promise<{ default: Record<string, string> }>>;

// @cpt-begin:cpt-template-site-flow-templates-screen-open-page:p1:inst-render-page
/** The screen's route token, the first segment of its twins' paths. */
const SCREEN = 'templates';
// @cpt-end:cpt-template-site-flow-templates-screen-open-page:p1:inst-render-page

// @cpt-begin:cpt-template-site-algo-templates-screen-card-art:p2:inst-icon
/** The icon of each template's row card, by the template's route. */
const TEMPLATE_ICONS: Readonly<Record<string, typeof Braces>> = {
  '/template-site': LayoutTemplate,
  '/template-catalogue': LibraryBig,
  '/template-inbox': Inbox,
  '/template-mfe-demo': Boxes,
  '/template-calendar-demo': CalendarDays,
};
// @cpt-end:cpt-template-site-algo-templates-screen-card-art:p2:inst-icon

/** The picture of a card: the shell, the MFE workspace and the design guardrails are drawn, every other template gets an icon. */
// @cpt-algo:cpt-template-site-algo-templates-screen-card-art:p2
function cardArt(target: Href) {
  // @cpt-begin:cpt-template-site-algo-templates-screen-card-art:p2:inst-no-route
  if (!('route' in target) || target.route === undefined) return undefined;
  // @cpt-end:cpt-template-site-algo-templates-screen-card-art:p2:inst-no-route
  // @cpt-begin:cpt-template-site-algo-templates-screen-card-art:p2:inst-drawn
  if (target.route === '/template-shell') return templateArt('shell');
  if (target.route === '/template-mfe') return templateArt('screens');
  if (target.route === '/template-design-guardrails') return templateArt('guardrails');
  // @cpt-end:cpt-template-site-algo-templates-screen-card-art:p2:inst-drawn
  // @cpt-begin:cpt-template-site-algo-templates-screen-card-art:p2:inst-icon
  const Icon = TEMPLATE_ICONS[target.route];
  return Icon ? <Icon aria-hidden /> : undefined;
  // @cpt-end:cpt-template-site-algo-templates-screen-card-art:p2:inst-icon
}

export interface TemplatesPageProps {
  route: string;
}

/** One templates page: the index or a template's page, read through the screen's API service, with a link to its plain-text twin at its end. */
// @cpt-flow:cpt-template-site-flow-templates-screen-open-page:p1
// @cpt-state:cpt-template-site-state-templates-screen-page:p2
// @cpt-dod:cpt-template-site-dod-templates-screen-pages:p1
export function TemplatesPage({ route }: TemplatesPageProps) {
  // @cpt-begin:cpt-template-site-flow-templates-screen-open-page:p1:inst-load-strings
  const bridge = useBridge();
  const { t, loading } = useScreenTranslations(languageModules, bridge);
  // @cpt-end:cpt-template-site-flow-templates-screen-open-page:p1:inst-load-strings
  // @cpt-begin:cpt-template-site-flow-templates-screen-open-page:p1:inst-read-outline
  const catalogue = useApiQuery(apiRegistry.getService(TemplatesApiService).getCatalogue);
  // @cpt-end:cpt-template-site-flow-templates-screen-open-page:p1:inst-read-outline

  // @cpt-begin:cpt-template-site-flow-templates-screen-open-page:p1:inst-if-loading
  // @cpt-begin:cpt-template-site-flow-templates-screen-open-page:p1:inst-return-loading
  if (loading || catalogue.isLoading) return <PageLoading />;
  // @cpt-end:cpt-template-site-flow-templates-screen-open-page:p1:inst-return-loading
  // @cpt-end:cpt-template-site-flow-templates-screen-open-page:p1:inst-if-loading
  // @cpt-begin:cpt-template-site-flow-templates-screen-open-page:p1:inst-find-page
  // The routes are built from the same bundled outline the service answers with, so a route always has its page; a page missing from the answer is a broken answer, not an unknown address.
  const page = catalogue.data && pageAt(catalogue.data, route);
  // @cpt-end:cpt-template-site-flow-templates-screen-open-page:p1:inst-find-page
  // @cpt-begin:cpt-template-site-flow-templates-screen-open-page:p1:inst-if-error
  // @cpt-begin:cpt-template-site-flow-templates-screen-open-page:p1:inst-return-error
  // @cpt-begin:cpt-template-site-state-templates-screen-page:p2:inst-to-failed
  if (catalogue.isError || !page) return <PageError message={t('error')} />;
  // @cpt-end:cpt-template-site-state-templates-screen-page:p2:inst-to-failed
  // @cpt-end:cpt-template-site-flow-templates-screen-open-page:p1:inst-return-error
  // @cpt-end:cpt-template-site-flow-templates-screen-open-page:p1:inst-if-error
  // @cpt-begin:cpt-template-site-flow-templates-screen-open-page:p1:inst-chrome-labels
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
  // @cpt-end:cpt-template-site-flow-templates-screen-open-page:p1:inst-chrome-labels

  // @cpt-begin:cpt-template-site-flow-templates-screen-open-page:p1:inst-render-page
  // @cpt-begin:cpt-template-site-state-templates-screen-page:p2:inst-to-shown
  return <OutlinePage page={page} translate={t} bridge={bridge} chrome={chrome} twinHref={twinPath(SCREEN, page.route)} screen={SCREEN} cardArt={cardArt} rail={false} />;
  // @cpt-end:cpt-template-site-state-templates-screen-page:p2:inst-to-shown
  // @cpt-end:cpt-template-site-flow-templates-screen-open-page:p1:inst-render-page
}
