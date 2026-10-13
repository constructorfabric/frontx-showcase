import { useEffect, useRef, useState, useSyncExternalStore, type ChangeEvent } from 'react';
import { LayoutGridIcon } from 'lucide-react';
import { Link, Outlet, useNavigate, useRouterState } from '@gears-frontx/routing-tanstack';
import { NativeSelectOptGroup, NativeSelectOption, Toaster } from '@gears-frontx/ui-kit';
import { CatalogueFrame, NARROW_QUERY } from '../../blocks/CatalogueFrame';
import { NavPanel, NavPanelFoot, NavPanelGroup, NavPanelRow } from '../../blocks/NavPanel';
import { PagePicker } from '../../blocks/PagePicker';
import { SectionTabs } from '../../blocks/SectionTabs';
import { COMPONENTS, FAMILIES, FOUNDATIONS, type CatalogueEntry } from '../../catalog';
import { KIT_VERSION } from '../../frame/kitVersion';
import { CatalogueSearchProvider } from './CatalogueSearch';
import { useCatalogueText } from './CatalogueText';
import { revealRow } from './revealRow';

/** Below this width the navigation panel gives way to a page select above the page: the frame block's one-column breakpoint. */
export { NARROW_QUERY };

/** The two sections of the tab bar. */
export type CatalogueSection = 'components' | 'foundations';

/**
 * The tab bar section a page belongs to: the index and every component page are Components, every foundation page is Foundations.
 * @param pathname - the path inside the screen
 */
// @cpt-flow:cpt-template-catalogue-flow-catalogue-screen-navigate:p1
// @cpt-dod:cpt-template-catalogue-dod-catalogue-screen-routes-navigation:p1
export function sectionOf(pathname: string): CatalogueSection | undefined {
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-mark-section
  if (pathname === '/' || pathname.startsWith('/components/')) return 'components';
  if (pathname.startsWith('/foundations/')) return 'foundations';
  return undefined;
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-mark-section
}

/** Where each tab leads: Foundations opens its first page, as the reference's tab opens its theme page. */
const SECTION_TARGET: Record<CatalogueSection, string> = {
  components: '/',
  foundations: FOUNDATIONS[0]?.path ?? '/',
};

const SECTIONS: readonly CatalogueSection[] = ['components', 'foundations'];

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

function usePathname(): string {
  return useRouterState({ select: (state) => state.location.pathname });
}

/** Components, Foundations: one link per section across the top of the screen, the current section underlined. */
function Sections() {
  const { t } = useCatalogueText();
  const pathname = usePathname();
  const current = sectionOf(pathname);
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-mark-section
  return (
    <SectionTabs
      label={t('sections_label')}
      tabs={SECTIONS.map((section) => ({
        id: section,
        label: t(section),
        render: <Link to={SECTION_TARGET[section]} />,
        current: section !== current ? undefined : SECTION_TARGET[section] === pathname ? 'page' : 'true',
        testId: `section-${section}`,
      }))}
    />
  );
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-mark-section
}

/**
 * One page of the panel. `sectionPage` marks a row that is a section's page in its own right (a foundation): its current row carries the fill, as the reference fills its Themes row. A component's current row only takes the ink colour, since its section's fill stays on All components.
 */
function PageRow({ entry, pathname, sectionPage = false, onCurrent }: { entry: CatalogueEntry; pathname: string; sectionPage?: boolean; onCurrent: (row: HTMLAnchorElement | null) => void }) {
  const { t } = useCatalogueText();
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-mark-current-row
  const current = entry.path === pathname;
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-mark-current-row
  return (
    <NavPanelRow
      icon={entry.icon}
      label={t(entry.labelKey)}
      render={<Link to={entry.path} />}
      ref={current ? onCurrent : undefined}
      current={current}
      sectionCurrent={current && sectionPage}
      testId={`nav-${entry.slug}`}
    />
  );
}

/**
 * The navigation panel: Components (the index, kept current on every component page), Foundations; then every component under its family's label, and the kit's version at the end.
 */
function Panel() {
  const { t } = useCatalogueText();
  const pathname = usePathname();
  const panel = useRef<HTMLElement>(null);
  const [activeRow, setActiveRow] = useState<HTMLAnchorElement | null>(null);
  // The panel scrolls its own rows, so a deep link (or a reload) far down the list would otherwise leave the current page's row out of sight. A row already in view stays where it is; the page itself never scrolls (see revealRow).
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-reveal-current-row
  useEffect(() => {
    if (panel.current && activeRow) revealRow(panel.current, activeRow, window.innerHeight);
  }, [activeRow]);
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-reveal-current-row
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-render-panel
  return (
    <NavPanel ref={panel} label={t('nav_label')} testId="catalogue-nav">
      <NavPanelGroup id="catalogue-nav-components" title={t('components')}>
        <NavPanelRow
          icon={LayoutGridIcon}
          label={t('all_components')}
          render={<Link to="/" />}
          current={pathname === '/'}
          sectionCurrent={sectionOf(pathname) === 'components'}
          testId="nav-all-components"
        />
      </NavPanelGroup>
      <NavPanelGroup id="catalogue-nav-foundations" title={t('foundations')}>
        {FOUNDATIONS.map((entry) => (
          <PageRow key={entry.path} entry={entry} pathname={pathname} sectionPage onCurrent={setActiveRow} />
        ))}
      </NavPanelGroup>
      {FAMILIES.map((family) => (
        <NavPanelGroup key={family} id={`catalogue-nav-${family}`} title={t(`family.${family}`)}>
          {COMPONENTS.filter((entry) => entry.family === family).map((entry) => (
            <PageRow key={entry.path} entry={entry} pathname={pathname} onCurrent={setActiveRow} />
          ))}
        </NavPanelGroup>
      ))}
      <NavPanelFoot label={t('built_with')} version={KIT_VERSION} note={t('demo_data')} />
    </NavPanel>
  );
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-render-panel
}

/** On a narrow screen every page is one option of a native select under the tab bar: the 70 rows would push the page far below the fold. */
function PageSelect() {
  const { t } = useCatalogueText();
  const pathname = usePathname();
  const navigate = useNavigate();
  // A component page shows the Components section's own option, as the reference's select does: the panel's fill stays on All components there too.
  const value = sectionOf(pathname) === 'components' ? '/' : pathname;
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-select-page
  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    void navigate({ to: event.target.value });
  };
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-select-page
  const option = (entry: CatalogueEntry) => (
    <NativeSelectOption key={entry.path} value={entry.path}>
      {t(entry.labelKey)}
    </NativeSelectOption>
  );
  return (
    <PagePicker id="catalogue-page-select" label={t('page_select')} value={value} onChange={onChange} testId="page-select">
      <NativeSelectOptGroup label={t('components')}>
        <NativeSelectOption value="/">{t('all_components')}</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label={t('foundations')}>{FOUNDATIONS.map(option)}</NativeSelectOptGroup>
      {FAMILIES.map((family) => (
        <NativeSelectOptGroup key={family} label={t(`family.${family}`)}>
          {COMPONENTS.filter((entry) => entry.family === family).map(option)}
        </NativeSelectOptGroup>
      ))}
    </PagePicker>
  );
}

function LayoutFrame() {
  const { t, loading } = useCatalogueText();
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-choose-panel-or-select
  const narrow = useMediaQuery(NARROW_QUERY);
  const picker = loading || !narrow ? null : <PageSelect />;
  const panel = loading || narrow ? null : <Panel />;
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-choose-panel-or-select
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-render-content
  return (
    <CatalogueFrame
      sections={loading ? null : <Sections />}
      picker={picker}
      panel={panel}
      // Named for the screen: the shell's own Toaster region is already called "Notifications", and two regions of one name are one landmark too many.
      overlay={<Toaster label={loading ? undefined : t('toast_region_label')} />}
    >
      <Outlet />
    </CatalogueFrame>
  );
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-render-content
}

/**
 * The catalogue's frame, laid out like the reference showcase: a tab bar (Components, Foundations) across the top, then a navigation panel and the current page; on a narrow screen a page select replaces the panel. Navigation rows are routing-tanstack `Link`s, so each page is its own address inside the screen. The toast region is mounted inside the screen, where the toast example sends its toasts.
 */
export function CatalogueLayout() {
  return (
    <CatalogueSearchProvider>
      <LayoutFrame />
    </CatalogueSearchProvider>
  );
}
