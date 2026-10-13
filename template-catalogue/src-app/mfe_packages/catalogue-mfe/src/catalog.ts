/**
 * The catalogue's pages: the 64 component example pages, discovered from `examples/*.tsx` (one module per component, loaded lazily so a broken example stays contained to its own page), and the three foundation pages. Each page has its own route inside the screen: `/components/<slug>` and `/foundations/<slug>`; `/` is the catalogue index.
 */
import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
// Direct icon imports: the kit ships no icons, so each navigation row picks its own (one per row, plus the fallback).
import {
  AppWindowIcon,
  ArrowLeftRightIcon,
  BadgeIcon,
  BellIcon,
  BellRingIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ChartColumnIcon,
  ChevronDownIcon,
  ChevronsDownUpIcon,
  ChevronsUpDownIcon,
  CircleDotIcon,
  CircleSmallIcon,
  CircleUserRoundIcon,
  ClipboardListIcon,
  CommandIcon,
  CompassIcon,
  ComponentIcon,
  DatabaseIcon,
  FoldVerticalIcon,
  FormInputIcon,
  GalleryHorizontalIcon,
  GalleryThumbnailsIcon,
  GalleryVerticalIcon,
  IdCardIcon,
  KeyboardIcon,
  KeyRoundIcon,
  LayersIcon,
  LayoutPanelTopIcon,
  ListChecksIcon,
  ListChevronsDownUpIcon,
  ListFilterIcon,
  ListIcon,
  LoaderCircleIcon,
  LoaderIcon,
  MapPinIcon,
  MenuIcon,
  MessageCircleIcon,
  MessageCircleQuestionIcon,
  MessageSquareDashedIcon,
  MessageSquareTextIcon,
  MessagesSquareIcon,
  MilestoneIcon,
  MinusIcon,
  MousePointer2Icon,
  MousePointerClickIcon,
  MoveHorizontalIcon,
  OctagonAlertIcon,
  PackageOpenIcon,
  PaletteIcon,
  PanelTopIcon,
  PanelBottomIcon,
  PanelLeftIcon,
  PanelRightIcon,
  PaperclipIcon,
  ProportionsIcon,
  RectangleEllipsisIcon,
  Rows3Icon,
  ScrollTextIcon,
  SlidersHorizontalIcon,
  SquareCheckIcon,
  SquareStackIcon,
  Table2Icon,
  TableIcon,
  TagIcon,
  TextCursorInputIcon,
  TextIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  TriangleAlertIcon,
  TypeIcon,
  type LucideIcon,
} from 'lucide-react';
import { decodeExampleSource } from './exampleSource';
import { LayoutElevationPage } from './pages/layout-elevation-page';
import { SemanticColorsPage } from './pages/semantic-colors-page';
import { TypographyPage } from './pages/typography-page';

type ExampleModule = { default: ComponentType };

/** One lazy loader per example file, keyed by its path, e.g. `./examples/button.tsx`. */
// @cpt-algo:cpt-template-catalogue-algo-catalogue-screen-page-registry:p1
// @cpt-dod:cpt-template-catalogue-dod-catalogue-screen-page-registry:p1
// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-page-registry:p1:inst-glob-examples
export const exampleLoaders = import.meta.glob<ExampleModule>('./examples/*.tsx');
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-page-registry:p1:inst-glob-examples

/** The source text of each example file, base64-encoded (`exampleSourcePlugin.ts`) and loaded lazily for the page's Code tab, keyed like `exampleLoaders`. */
// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-page-registry:p1:inst-glob-sources
export const exampleSources = import.meta.glob<string>('./examples/*.tsx', { query: '?example-source', import: 'default' });
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-page-registry:p1:inst-glob-sources

/** The component families of the index and the navigation, in their display order. */
export const FAMILIES = ['actions', 'forms', 'data-display', 'feedback', 'navigation', 'disclosure', 'overlay', 'layout', 'chat'] as const;

export type Family = (typeof FAMILIES)[number];

/** The icon of each family's card header on the index. */
export const FAMILY_ICON: Record<Family, LucideIcon> = {
  'actions': MousePointer2Icon,
  'forms': TextCursorInputIcon,
  'data-display': Table2Icon,
  'feedback': BellIcon,
  'navigation': PanelTopIcon,
  'disclosure': LayersIcon,
  'overlay': AppWindowIcon,
  'layout': LayoutPanelTopIcon,
  'chat': MessagesSquareIcon,
};

/** The family of each component, by slug; a test holds every example file to one family. */
const FAMILY_OF: Record<string, Family> = {
  'button': 'actions',
  'button-group': 'actions',
  'toggle': 'actions',
  'toggle-group': 'actions',
  'calendar': 'forms',
  'checkbox': 'forms',
  'combobox': 'forms',
  'date-picker': 'forms',
  'field': 'forms',
  'input': 'forms',
  'input-group': 'forms',
  'input-otp': 'forms',
  'label': 'forms',
  'native-select': 'forms',
  'radio-group': 'forms',
  'select': 'forms',
  'slider': 'forms',
  'switch': 'forms',
  'textarea': 'forms',
  'avatar': 'data-display',
  'badge': 'data-display',
  'card': 'data-display',
  'carousel': 'data-display',
  'chart': 'data-display',
  'data-table': 'data-display',
  'item': 'data-display',
  'kbd': 'data-display',
  'marker': 'data-display',
  'status-dot': 'data-display',
  'table': 'data-display',
  'alert': 'feedback',
  'empty': 'feedback',
  'progress': 'feedback',
  'skeleton': 'feedback',
  'spinner': 'feedback',
  'toast': 'feedback',
  'breadcrumb': 'navigation',
  'command': 'navigation',
  'menubar': 'navigation',
  'navigation-menu': 'navigation',
  'pagination': 'navigation',
  'sidebar': 'navigation',
  'tabs': 'navigation',
  'accordion': 'disclosure',
  'collapsible': 'disclosure',
  'alert-dialog': 'overlay',
  'context-menu': 'overlay',
  'dialog': 'overlay',
  'drawer': 'overlay',
  'dropdown-menu': 'overlay',
  'hover-card': 'overlay',
  'popover': 'overlay',
  'sheet': 'overlay',
  'tooltip': 'overlay',
  'aspect-ratio': 'layout',
  'direction': 'layout',
  'resizable': 'layout',
  'scroll-area': 'layout',
  'separator': 'layout',
  'attachment': 'chat',
  'bubble': 'chat',
  'message': 'chat',
  'message-scroller': 'chat',
  'questionnaire': 'chat',
};


export interface CatalogueEntry {
  kind: 'component' | 'foundation';
  /** Filename stem or foundation slug, e.g. `dropdown-menu`. */
  slug: string;
  /** The page's path inside the screen. */
  path: string;
  /** The key of the page's name in the screen's strings: the navigation row, the page heading and the page title show it. */
  labelKey: string;
  icon: LucideIcon;
}

export interface ComponentEntry extends CatalogueEntry {
  kind: 'component';
  /** The component's family; `undefined` only for an example file added before `FAMILY_OF` names it, which the catalogue test catches. */
  family: Family | undefined;
  /** The example file's source text. */
  loadSource: () => Promise<string>;
  Component: LazyExoticComponent<ComponentType>;
}

export interface FoundationEntry extends CatalogueEntry {
  kind: 'foundation';
  Component: ComponentType;
}

/** One lucide icon per navigation row, keyed by slug; `ComponentIcon` covers an example file added before this table. */
const ICON_MAP: Record<string, LucideIcon> = {
  'semantic-colors': PaletteIcon,
  typography: TypeIcon,
  'layout-elevation': LayersIcon,
  accordion: FoldVerticalIcon,
  alert: TriangleAlertIcon,
  'alert-dialog': OctagonAlertIcon,
  'aspect-ratio': ProportionsIcon,
  attachment: PaperclipIcon,
  avatar: CircleUserRoundIcon,
  badge: BadgeIcon,
  breadcrumb: MilestoneIcon,
  bubble: MessageCircleIcon,
  button: MousePointerClickIcon,
  'button-group': SquareStackIcon,
  calendar: CalendarIcon,
  card: LayoutPanelTopIcon,
  carousel: GalleryHorizontalIcon,
  chart: ChartColumnIcon,
  checkbox: SquareCheckIcon,
  collapsible: ChevronsDownUpIcon,
  combobox: ListFilterIcon,
  command: CommandIcon,
  'context-menu': MousePointer2Icon,
  'data-table': DatabaseIcon,
  'date-picker': CalendarDaysIcon,
  dialog: AppWindowIcon,
  direction: ArrowLeftRightIcon,
  drawer: PanelBottomIcon,
  'dropdown-menu': ChevronDownIcon,
  empty: PackageOpenIcon,
  field: FormInputIcon,
  'hover-card': IdCardIcon,
  input: TextCursorInputIcon,
  'input-group': Rows3Icon,
  'input-otp': KeyRoundIcon,
  item: ListIcon,
  kbd: KeyboardIcon,
  label: TagIcon,
  marker: MapPinIcon,
  menubar: MenuIcon,
  message: MessageSquareTextIcon,
  'message-scroller': MessagesSquareIcon,
  'native-select': ListChevronsDownUpIcon,
  'navigation-menu': CompassIcon,
  pagination: GalleryThumbnailsIcon,
  popover: MessageSquareDashedIcon,
  progress: LoaderIcon,
  questionnaire: ClipboardListIcon,
  'radio-group': CircleDotIcon,
  resizable: MoveHorizontalIcon,
  'scroll-area': ScrollTextIcon,
  select: ChevronsUpDownIcon,
  separator: MinusIcon,
  sheet: PanelRightIcon,
  sidebar: PanelLeftIcon,
  skeleton: RectangleEllipsisIcon,
  slider: SlidersHorizontalIcon,
  spinner: LoaderCircleIcon,
  'status-dot': CircleSmallIcon,
  switch: ToggleLeftIcon,
  table: TableIcon,
  tabs: GalleryVerticalIcon,
  textarea: TextIcon,
  toast: BellRingIcon,
  toggle: ToggleRightIcon,
  'toggle-group': ListChecksIcon,
  tooltip: MessageCircleQuestionIcon,
};

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-page-registry:p1:inst-foundation-entries
export const FOUNDATIONS: FoundationEntry[] = [
  { kind: 'foundation', slug: 'semantic-colors', path: '/foundations/semantic-colors', labelKey: 'label.semantic-colors', icon: ICON_MAP['semantic-colors'] ?? ComponentIcon, Component: SemanticColorsPage },
  { kind: 'foundation', slug: 'typography', path: '/foundations/typography', labelKey: 'label.typography', icon: ICON_MAP.typography ?? ComponentIcon, Component: TypographyPage },
  { kind: 'foundation', slug: 'layout-elevation', path: '/foundations/layout-elevation', labelKey: 'label.layout-elevation', icon: ICON_MAP['layout-elevation'] ?? ComponentIcon, Component: LayoutElevationPage },
];
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-page-registry:p1:inst-foundation-entries

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-page-registry:p1:inst-component-entries
export const COMPONENTS: ComponentEntry[] = Object.entries(exampleLoaders)
  .map(([file, load]): ComponentEntry => {
    const slug = file.replace(/^\.\/examples\//, '').replace(/\.tsx$/, '');
    return {
      kind: 'component',
      slug,
      path: `/components/${slug}`,
      labelKey: `label.${slug}`,
      icon: ICON_MAP[slug] ?? ComponentIcon,
      family: FAMILY_OF[slug],
      loadSource: () => {
        const loadSource = exampleSources[file];
        return loadSource ? loadSource().then(decodeExampleSource) : Promise.reject(new Error(`no source for ${file}`));
      },
      Component: lazy(load),
    };
  })
  .sort((a, b) => a.slug.localeCompare(b.slug));
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-page-registry:p1:inst-component-entries

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-page-registry:p1:inst-lookups
/** The components of a family, in slug order. */
export function componentsOf(family: Family): ComponentEntry[] {
  return COMPONENTS.filter((entry) => entry.family === family);
}

export function findComponent(slug: string): ComponentEntry | undefined {
  return COMPONENTS.find((entry) => entry.slug === slug);
}

export function findFoundation(slug: string): FoundationEntry | undefined {
  return FOUNDATIONS.find((entry) => entry.slug === slug);
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-page-registry:p1:inst-lookups

/** Every page path of the screen: the index, the foundations and the components. */
// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-page-registry:p1:inst-all-paths
export const CATALOGUE_PATHS: readonly string[] = ['/', ...FOUNDATIONS.map((entry) => entry.path), ...COMPONENTS.map((entry) => entry.path)];
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-page-registry:p1:inst-all-paths
