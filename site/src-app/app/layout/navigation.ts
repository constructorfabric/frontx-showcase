/**
 * The site navigation, derived from the registered screen extensions.
 *
 * Every entry comes from an extension's own declaration: its `route` token, its
 * `presentation.label` and `presentation.order`, and its optional
 * `presentation.group`, the id of a nav group instance the host defines
 * (`navGroups.ts`). Nothing here names a screen. A screen without a group, or
 * with a group the host does not define, is a top-level entry; screens sharing
 * a group become one entry that lists them, placed at the order of its first
 * member.
 */
import { deriveExtensionToken, serializeGrammar, validateName, type DomainKey } from '@gears-frontx/routing';

/** The fields of a registered screen extension the navigation reads. */
export interface NavigableScreen {
  id: string;
  route: string;
  presentation: { label: string; order?: number; group?: unknown };
}

export interface NavScreen {
  kind: 'screen';
  id: string;
  /** The extension token of the screen's route (`home` for `/home`), the name `site.config.json` uses for the home screen. */
  token: string;
  label: string;
  order: number;
  href: string;
  active: boolean;
}

export interface NavGroup {
  kind: 'group';
  id: string;
  order: number;
  active: boolean;
  items: NavScreen[];
}

export type NavEntry = NavScreen | NavGroup;

const UNORDERED = Number.MAX_SAFE_INTEGER;

/**
 * A site-root path (`/`, `/?screen=docs`) as a link relative to the shell's document (`./`, `./?screen=docs`). The site is served from whatever folder it was deployed to, the root of an origin or a sub-path, and its document always sits in that folder, so a document-relative link reaches the same page at any mount point with no deploy configuration; a root-absolute one would leave a sub-path for the origin root on a new-tab open, a copied link or a crawl. FrontX has no API that returns an address for a link (DESIGN gap G39).
 * @param sitePath - a path from the site root, starting with `/`
 */
// @cpt-algo:cpt-site-algo-shell-layout-navigation-canonical-address:p1
export function documentHref(sitePath: string): string {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-canonical-address:p1:inst-if-not-site-root
  if (!sitePath.startsWith('/')) throw new Error(`not a site-root path: ${sitePath}`);
  // @cpt-end:cpt-site-algo-shell-layout-navigation-canonical-address:p1:inst-if-not-site-root
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-canonical-address:p1:inst-relative
  return `.${sitePath}`;
  // @cpt-end:cpt-site-algo-shell-layout-navigation-canonical-address:p1:inst-relative
}

/**
 * The canonical address of a screen root, in the routing grammar the framework router writes the URL with, relative to the shell's document.
 * @param domainKey - the screen domain's URL key (`screenDomain.route`)
 * @param route - the extension's `route` (`/home`)
 * @returns the address, or `undefined` for a route the grammar cannot carry
 */
export function screenHref(domainKey: string, route: string): string | undefined {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-canonical-address:p1:inst-if-no-token
  const extension = deriveExtensionToken(route);
  if (!extension || !validateName(domainKey)) return undefined;
  // @cpt-end:cpt-site-algo-shell-layout-navigation-canonical-address:p1:inst-if-no-token
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-canonical-address:p1:inst-serialize
  // validateName checked the key against the grammar's name production, which is what the brand marks.
  return documentHref(serializeGrammar({ shellSubroute: '/', hash: undefined, entries: [{ domainKey: domainKey as DomainKey, extension, params: [] }] }));
  // @cpt-end:cpt-site-algo-shell-layout-navigation-canonical-address:p1:inst-serialize
}

/** The name of the host-defined group a screen names in `presentation.group`; a group id the host does not define is no group. */
// @cpt-algo:cpt-site-algo-shell-layout-navigation-read-group:p1
function groupOf(screen: NavigableScreen, groups: ReadonlyMap<string, string>): string | undefined {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-read-group:p1:inst-return-group
  const group = screen.presentation.group;
  return typeof group === 'string' ? groups.get(group) : undefined;
  // @cpt-end:cpt-site-algo-shell-layout-navigation-read-group:p1:inst-return-group
}

/**
 * The navigation entries in menu order.
 * @param screens - the registered screen extensions
 * @param domainKey - the screen domain's URL key
 * @param activeId - the mounted screen extension, if any
 * @param groups - the name of each nav group the host defines, by its instance id
 */
// @cpt-dod:cpt-site-dod-shell-layout-navigation-header-navigation:p1
// @cpt-algo:cpt-site-algo-shell-layout-navigation-build-entries:p1
export function buildNavigation(screens: readonly NavigableScreen[], domainKey: string, activeId: string | undefined, groups: ReadonlyMap<string, string>): NavEntry[] {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-build-entries:p1:inst-order
  const ordered = [...screens].sort((a, b) => (a.presentation.order ?? UNORDERED) - (b.presentation.order ?? UNORDERED) || a.presentation.label.localeCompare(b.presentation.label));
  // @cpt-end:cpt-site-algo-shell-layout-navigation-build-entries:p1:inst-order
  const entries: NavEntry[] = [];
  const grouped = new Map<string, NavGroup>();
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-build-entries:p1:inst-for-each-screen
  for (const screen of ordered) {
    // @cpt-begin:cpt-site-algo-shell-layout-navigation-build-entries:p1:inst-if-unaddressable
    const href = screenHref(domainKey, screen.route);
    const token = deriveExtensionToken(screen.route);
    // A screen the grammar cannot address has no link; the shell cannot show it at an address either.
    if (href === undefined || token === undefined) continue;
    // @cpt-end:cpt-site-algo-shell-layout-navigation-build-entries:p1:inst-if-unaddressable
    // @cpt-begin:cpt-site-algo-shell-layout-navigation-build-entries:p1:inst-make-entry
    const item: NavScreen = { kind: 'screen', id: screen.id, token, label: screen.presentation.label, order: screen.presentation.order ?? UNORDERED, href, active: screen.id === activeId };
    // @cpt-end:cpt-site-algo-shell-layout-navigation-build-entries:p1:inst-make-entry
    // @cpt-begin:cpt-site-algo-shell-layout-navigation-build-entries:p1:inst-if-ungrouped
    const group = groupOf(screen, groups);
    if (group === undefined) {
      entries.push(item);
      continue;
    }
    // @cpt-end:cpt-site-algo-shell-layout-navigation-build-entries:p1:inst-if-ungrouped
    // @cpt-begin:cpt-site-algo-shell-layout-navigation-build-entries:p1:inst-else-grouped
    let entry = grouped.get(group);
    if (!entry) {
      entry = { kind: 'group', id: group, order: item.order, active: false, items: [] };
      grouped.set(group, entry);
      entries.push(entry);
    }
    entry.items.push(item);
    entry.active ||= item.active;
    // @cpt-end:cpt-site-algo-shell-layout-navigation-build-entries:p1:inst-else-grouped
  }
  // @cpt-end:cpt-site-algo-shell-layout-navigation-build-entries:p1:inst-for-each-screen
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-build-entries:p1:inst-return-entries
  return entries;
  // @cpt-end:cpt-site-algo-shell-layout-navigation-build-entries:p1:inst-return-entries
}

/**
 * The entries without the groups the header leaves out. The screens of a hidden group stay registered and addressable; only the header's menu stops listing them, so another way in (a page that lists them) is the caller's to provide.
 * @param entries - the navigation entries
 * @param hidden - group names from `site.config.json` (`headerHiddenGroups`)
 */
// @cpt-algo:cpt-site-algo-shell-layout-navigation-site-choices:p1
export function withoutGroups(entries: readonly NavEntry[], hidden: readonly string[]): NavEntry[] {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-site-choices:p1:inst-without-groups
  return entries.filter((entry) => entry.kind === 'screen' || !hidden.includes(entry.id));
  // @cpt-end:cpt-site-algo-shell-layout-navigation-site-choices:p1:inst-without-groups
}

/**
 * The screen whose route token is `token`, wherever it sits in the menu (a screen inside a group counts too). Menu order plays no part, so adding a screen with a lower `presentation.order` never moves the home screen or a footer link.
 * @param entries - the navigation entries
 * @param token - a route token from `site.config.json` (`homeScreen`, `footerScreens`)
 */
export function screenByToken(entries: readonly NavEntry[], token: string): NavScreen | undefined {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-site-choices:p1:inst-screen-by-token
  return entries.flatMap((entry) => (entry.kind === 'screen' ? [entry] : entry.items)).find((screen) => screen.token === token);
  // @cpt-end:cpt-site-algo-shell-layout-navigation-site-choices:p1:inst-screen-by-token
}

/**
 * The mounted screen, wherever it sits in the menu.
 * @param entries - the navigation entries
 */
export function activeScreen(entries: readonly NavEntry[]): NavScreen | undefined {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-site-choices:p1:inst-active-screen
  return entries.flatMap((entry) => (entry.kind === 'screen' ? [entry] : entry.items)).find((screen) => screen.active);
  // @cpt-end:cpt-site-algo-shell-layout-navigation-site-choices:p1:inst-active-screen
}

/**
 * The site's home screen: the brand links to it and the bare address opens it.
 * @param entries - the navigation entries
 * @param token - the route token `site.config.json` names as `homeScreen`
 */
export function homeScreen(entries: readonly NavEntry[], token: string): NavScreen | undefined {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-site-choices:p1:inst-screen-by-token
  return screenByToken(entries, token);
  // @cpt-end:cpt-site-algo-shell-layout-navigation-site-choices:p1:inst-screen-by-token
}

/** Whether a click is a plain primary click the page may handle itself; any other click keeps the browser's own link behaviour (new tab, download, ...). */
// @cpt-flow:cpt-site-flow-shell-layout-navigation-open-screen:p1
export function isPlainClick(event: { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean; defaultPrevented: boolean }): boolean {
  // @cpt-begin:cpt-site-flow-shell-layout-navigation-open-screen:p1:inst-if-modified-click
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.defaultPrevented;
  // @cpt-end:cpt-site-flow-shell-layout-navigation-open-screen:p1:inst-if-modified-click
}
