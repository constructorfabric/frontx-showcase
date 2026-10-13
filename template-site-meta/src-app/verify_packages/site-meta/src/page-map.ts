/**
 * The resolved page map and the lookup from an address to its page. Shared by the generator (Node) and the head-sync runtime (browser), so it imports nothing but `@gears-frontx/routing`.
 */
import { parseGrammar, serializeGrammar, type DomainKey, type ExtensionToken } from '@gears-frontx/routing';

/**
 * The parameter of a screen's entry that carries the path inside the screen (`/?screen=catalogue;route=components/button`). routing-tanstack projects it onto the screen's virtual pathname but keeps the name internal; this is the one place the site names it, and `route-convention.test.ts` fails if routing-tanstack ever reads another name.
 */
// @cpt-begin:cpt-template-site-meta-algo-page-map-canonical-address:p1:inst-route-param
export const ROUTE_PARAM = 'route';
// @cpt-end:cpt-template-site-meta-algo-page-map-canonical-address:p1:inst-route-param

/** Everything the head carries for one page. */
export interface PageMeta {
  /** Absolute canonical URL. */
  readonly canonical: string;
  /** Origin-relative address, as the browser shows it. */
  readonly address: string;
  /** The screen token, or `null` for the site-level fallback. */
  readonly screen: string | null;
  /** The path inside the screen (`/` for the screen root, the pattern for a pattern route). */
  readonly route: string;
  /** The page's own title (the link text in `llms.txt` and the twins). */
  readonly title: string;
  /** The document title, also the `og:title` and `twitter:title`: the site name for the home page, the title template applied to `title` otherwise. */
  readonly documentTitle: string;
  readonly description: string;
  readonly indexable: boolean;
  readonly ogImage?: string;
}

/** One screen's pages: static paths, and pattern routes (a segment starting with `$` matches any one segment). */
export interface ScreenPages {
  /** The screen extension's GTS id, the name a link to the screen gives it. */
  readonly extension: string;
  readonly label: string;
  readonly order: number;
  readonly pages: Readonly<Record<string, PageMeta>>;
  readonly patterns: readonly PageMeta[];
}

/** The page map the generator writes and head-sync reads. */
export interface SiteMetaMap {
  readonly siteName: string;
  readonly origin: string;
  readonly locale: string;
  readonly twitterCard: string;
  /** The share image, an absolute URL, and its alternative text. */
  readonly ogImage?: string;
  readonly ogImageAlt?: string;
  /** The browser UI color of the site (`theme-color`, and the web manifest's). */
  readonly themeColor?: string;
  /** The screen domain's key in the URL grammar (the `route` of the shell's screen domain instance). */
  readonly domainKey: string;
  readonly routeParam: string;
  /** The home page: the root of the configured home screen. */
  readonly home: PageMeta;
  /** The head for an address that names no page of the site (not indexable, canonical to the home page). */
  readonly fallback: PageMeta;
  readonly screens: Readonly<Record<string, ScreenPages>>;
}

/** Whether a route path has a parameter segment. */
// @cpt-begin:cpt-template-site-meta-algo-page-map-resolve-page:p1:inst-pattern-rule
export function isPattern(route: string): boolean {
  return route.split('/').some((segment) => segment.startsWith('$'));
}
// @cpt-end:cpt-template-site-meta-algo-page-map-resolve-page:p1:inst-pattern-rule

/** Whether a concrete path matches a pattern route segment by segment. */
// @cpt-begin:cpt-template-site-meta-algo-page-map-resolve-page:p1:inst-match-pattern
export function matchesPattern(pattern: string, path: string): boolean {
  const patternSegments = pattern.split('/');
  const pathSegments = path.split('/');
  if (patternSegments.length !== pathSegments.length) return false;
  return patternSegments.every((segment, index) => {
    const actual = pathSegments[index] ?? '';
    return segment.startsWith('$') ? actual !== '' : segment === actual;
  });
}
// @cpt-end:cpt-template-site-meta-algo-page-map-resolve-page:p1:inst-match-pattern

/** The virtual path a `route` parameter value names: `components/button` -> `/components/button`, absent -> `/`. */
// @cpt-begin:cpt-template-site-meta-algo-page-map-resolve-page:p1:inst-route-path
export function routePathFromParam(value: string | undefined): string {
  const trimmed = (value ?? '').replace(/^\/+/, '').replace(/\/+$/, '');
  return trimmed === '' ? '/' : `/${trimmed}`;
}
// @cpt-end:cpt-template-site-meta-algo-page-map-resolve-page:p1:inst-route-path

/** The address parts head-sync reads from the navigation history. */
export interface AddressParts {
  readonly path: string;
  readonly search: string;
  readonly hash?: string;
}

/**
 * The canonical address of a page inside a screen, written by `serializeGrammar` (the function the framework router writes the URL with) from the screen entry and its `route` parameter alone: `/?screen=<token>` for the screen root, `/?screen=<token>;route=<path>` inside it.
 * @param domainKey - the screen domain's key
 * @param routeParam - the name of the entry parameter that carries the path inside the screen
 * @param token - the screen token
 * @param route - the path inside the screen
 */
// @cpt-algo:cpt-template-site-meta-algo-page-map-canonical-address:p1
export function screenAddress(domainKey: string, routeParam: string, token: string, route: string): string {
  // @cpt-begin:cpt-template-site-meta-algo-page-map-canonical-address:p1:inst-route-value
  const value = route.replace(/^\/+/, '');
  // @cpt-end:cpt-template-site-meta-algo-page-map-canonical-address:p1:inst-route-value
  // @cpt-begin:cpt-template-site-meta-algo-page-map-canonical-address:p1:inst-serialize-address
  return serializeGrammar({
    shellSubroute: '/',
    hash: undefined,
    entries: [
      {
        domainKey: domainKey as DomainKey,
        extension: token as ExtensionToken,
        params: value === '' ? [] : [{ name: routeParam, value }],
      },
    ],
  });
  // @cpt-end:cpt-template-site-meta-algo-page-map-canonical-address:p1:inst-serialize-address
}

/**
 * The page an address shows: the screen entry of the screen domain and its `route` parameter, looked up among the screen's static pages, then its pattern routes. A pattern page's canonical is the screen entry with that route alone, so other domains' entries and the order of the query do not change it. The bare shell root (`/` with nothing in its query) is the home page: the shell opens the home screen there through `mount_ext` with the `replace` history intent, so the head is already the home page's while that mount runs. Any other address with no screen entry, an unknown screen or an unknown path inside a screen resolves to the fallback. Lookups take own keys only, so a token such as `constructor` never reaches an object's prototype.
 * @param map - the site's page map
 * @param address - path, query and hash of the current location
 */
// @cpt-algo:cpt-template-site-meta-algo-page-map-resolve-page:p1
export function resolvePage(map: SiteMetaMap, address: AddressParts): PageMeta {
  // @cpt-begin:cpt-template-site-meta-algo-page-map-resolve-page:p1:inst-parse-address
  const parsed = parseGrammar({ shellSubroute: address.path, search: address.search.replace(/^\?/, ''), hash: address.hash });
  // @cpt-end:cpt-template-site-meta-algo-page-map-resolve-page:p1:inst-parse-address
  // @cpt-begin:cpt-template-site-meta-algo-page-map-resolve-page:p1:inst-if-bare-mount
  // The bare address of the mount point, `/` or the sub-path the site is served under (the path of its origin): the shell opens the home screen there.
  if (parsed.entries.length === 0 && parsed.foreignSegments.length === 0 && parsed.shellSubroute === new URL(`${map.origin}/`).pathname) return map.home;
  // @cpt-end:cpt-template-site-meta-algo-page-map-resolve-page:p1:inst-if-bare-mount
  // @cpt-begin:cpt-template-site-meta-algo-page-map-resolve-page:p1:inst-if-no-screen-entry
  const entry = parsed.entries.find((candidate) => candidate.domainKey === map.domainKey);
  if (!entry) return map.fallback;
  // @cpt-end:cpt-template-site-meta-algo-page-map-resolve-page:p1:inst-if-no-screen-entry
  // @cpt-begin:cpt-template-site-meta-algo-page-map-resolve-page:p1:inst-if-unknown-screen
  if (!Object.hasOwn(map.screens, entry.extension)) return map.fallback;
  const screen = map.screens[entry.extension] as ScreenPages;
  // @cpt-end:cpt-template-site-meta-algo-page-map-resolve-page:p1:inst-if-unknown-screen
  // @cpt-begin:cpt-template-site-meta-algo-page-map-resolve-page:p1:inst-take-path
  const path = routePathFromParam(entry.params.find((param) => param.name === map.routeParam)?.value);
  // @cpt-end:cpt-template-site-meta-algo-page-map-resolve-page:p1:inst-take-path
  // @cpt-begin:cpt-template-site-meta-algo-page-map-resolve-page:p1:inst-if-static-page
  if (Object.hasOwn(screen.pages, path)) return screen.pages[path] as PageMeta;
  // @cpt-end:cpt-template-site-meta-algo-page-map-resolve-page:p1:inst-if-static-page
  // @cpt-begin:cpt-template-site-meta-algo-page-map-resolve-page:p1:inst-if-no-pattern
  const pattern = screen.patterns.find((candidate) => matchesPattern(candidate.route, path));
  if (!pattern) return map.fallback;
  // @cpt-end:cpt-template-site-meta-algo-page-map-resolve-page:p1:inst-if-no-pattern
  // @cpt-begin:cpt-template-site-meta-algo-page-map-resolve-page:p1:inst-return-pattern-page
  const canonicalAddress = screenAddress(map.domainKey, map.routeParam, entry.extension, path);
  return { ...pattern, address: canonicalAddress, canonical: `${map.origin}${canonicalAddress}` };
  // @cpt-end:cpt-template-site-meta-algo-page-map-resolve-page:p1:inst-return-pattern-page
}
