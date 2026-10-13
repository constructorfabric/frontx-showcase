/**
 * The plain-text twins for the dev server. A build writes them into `dist/` (`generate`); the dev server has no `dist`, so its middleware asks here for the twin at a request path and renders it from the current sources on every request, the same way the build does. The project's `vite.config.ts` loads this module at run time (Node strips the types), so the shell's own type-check of its config never compiles this package.
 */
import { readOutlines, renderTwins, type Twin } from './twins.ts';
import { buildPageMap, readJson, readScreenDomain, readScreenExtensions, type SiteConfig, type SitePaths } from './site.ts';

/**
 * The content type a twin is served with: plain text in UTF-8. A browser shows `text/plain` in the tab, so the "Plain-text guide" link opens the text; it downloads `text/markdown` or an unknown type instead. A static host serves the generated `*.md` files with the same type.
 */
// @cpt-begin:cpt-template-site-meta-flow-plain-text-twins-dev-twin:p2:inst-media-type
export const TWIN_CONTENT_TYPE = 'text/plain; charset=utf-8';
// @cpt-end:cpt-template-site-meta-flow-plain-text-twins-dev-twin:p2:inst-media-type

/**
 * The twin served at `requestPath` (`/docs/get-started.md`), with links built on `origin` and the content type to serve it with, or `undefined` when no outline page has that path.
 * @param paths - the project and its site config (`sitePaths`)
 * @param origin - the dev server's origin
 * @param requestPath - the request's path
 */
// @cpt-flow:cpt-template-site-meta-flow-plain-text-twins-dev-twin:p2
// @cpt-dod:cpt-template-site-meta-dod-plain-text-twins-dev:p2
export function devTwin(paths: SitePaths, origin: string, requestPath: string): (Twin & { contentType: string }) | undefined {
  // @cpt-begin:cpt-template-site-meta-flow-plain-text-twins-dev-twin:p2:inst-if-not-twin-path
  if (!requestPath.endsWith('.md')) return undefined;
  // @cpt-end:cpt-template-site-meta-flow-plain-text-twins-dev-twin:p2:inst-if-not-twin-path
  // @cpt-begin:cpt-template-site-meta-flow-plain-text-twins-dev-twin:p2:inst-build-dev-map
  const config = readJson<SiteConfig>(paths.config);
  const domain = readScreenDomain(paths.screenDomain);
  const map = buildPageMap(config, origin, domain.key, readScreenExtensions(paths.packages, domain.id));
  // @cpt-end:cpt-template-site-meta-flow-plain-text-twins-dev-twin:p2:inst-build-dev-map
  // @cpt-begin:cpt-template-site-meta-flow-plain-text-twins-dev-twin:p2:inst-find-twin
  const twin = renderTwins(readOutlines(paths.packages), map).find((candidate) => candidate.path === requestPath);
  // @cpt-end:cpt-template-site-meta-flow-plain-text-twins-dev-twin:p2:inst-find-twin
  // @cpt-begin:cpt-template-site-meta-flow-plain-text-twins-dev-twin:p2:inst-return-twin
  return twin ? { ...twin, contentType: TWIN_CONTENT_TYPE } : undefined;
  // @cpt-end:cpt-template-site-meta-flow-plain-text-twins-dev-twin:p2:inst-return-twin
}

// @cpt-begin:cpt-template-site-meta-flow-plain-text-twins-dev-twin:p2:inst-reexport-paths
export { sitePaths } from './site.ts';
// @cpt-end:cpt-template-site-meta-flow-plain-text-twins-dev-twin:p2:inst-reexport-paths
