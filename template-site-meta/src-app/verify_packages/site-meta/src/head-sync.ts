/**
 * head-sync: keeps the document head equal to the page the address shows. It runs in the browser from an inline script of `dist/index.html`, before the app boots, and writes the head only, never the URL: the address changes only through the framework router.
 */
import { resolveNavigationHistory, type NavigationHistory } from '@gears-frontx/routing';
import { resolvePage, type AddressParts, type PageMeta, type SiteMetaMap } from './page-map.ts';

/** Marks the head nodes head-sync owns. */
export const OWNED_ATTRIBUTE = 'data-site-meta';

/** The id of the inert script node that carries the page map in `dist/index.html`. */
export const MAP_ELEMENT_ID = 'site-meta-map';

type HeadTag = { kind: 'meta-name' | 'meta-property' | 'link-rel'; key: string; value: string };

/** The head tags of one page, in a stable order. */
// @cpt-algo:cpt-template-site-meta-algo-head-sync-head-tags:p1
// @cpt-dod:cpt-template-site-meta-dod-head-sync-page-head:p1
export function headTagsFor(map: SiteMetaMap, page: PageMeta): HeadTag[] {
  // @cpt-begin:cpt-template-site-meta-algo-head-sync-head-tags:p1:inst-share-image
  const ogImage = page.ogImage ?? map.ogImage;
  // @cpt-end:cpt-template-site-meta-algo-head-sync-head-tags:p1:inst-share-image
  // @cpt-begin:cpt-template-site-meta-algo-head-sync-head-tags:p1:inst-share-title
  // A shared link shows the document title (the site name on the home page), as the designer's V2 site shares its pages.
  const title = page.documentTitle;
  // @cpt-end:cpt-template-site-meta-algo-head-sync-head-tags:p1:inst-share-title
  // @cpt-begin:cpt-template-site-meta-algo-head-sync-head-tags:p1:inst-base-tags
  const tags: HeadTag[] = [
    { kind: 'meta-name', key: 'description', value: page.description },
    { kind: 'meta-name', key: 'robots', value: page.indexable ? 'index, follow' : 'noindex, follow' },
    { kind: 'link-rel', key: 'canonical', value: page.canonical },
    { kind: 'meta-property', key: 'og:type', value: 'website' },
    { kind: 'meta-property', key: 'og:site_name', value: map.siteName },
    { kind: 'meta-property', key: 'og:title', value: title },
    { kind: 'meta-property', key: 'og:description', value: page.description },
    { kind: 'meta-property', key: 'og:url', value: page.canonical },
    { kind: 'meta-property', key: 'og:locale', value: map.locale },
  ];
  // @cpt-end:cpt-template-site-meta-algo-head-sync-head-tags:p1:inst-base-tags
  // @cpt-begin:cpt-template-site-meta-algo-head-sync-head-tags:p1:inst-og-image
  if (ogImage) tags.push({ kind: 'meta-property', key: 'og:image', value: ogImage });
  if (ogImage && map.ogImageAlt) tags.push({ kind: 'meta-property', key: 'og:image:alt', value: map.ogImageAlt });
  // @cpt-end:cpt-template-site-meta-algo-head-sync-head-tags:p1:inst-og-image
  // @cpt-begin:cpt-template-site-meta-algo-head-sync-head-tags:p1:inst-twitter-tags
  tags.push(
    { kind: 'meta-name', key: 'twitter:card', value: map.twitterCard },
    { kind: 'meta-name', key: 'twitter:title', value: title },
    { kind: 'meta-name', key: 'twitter:description', value: page.description }
  );
  // @cpt-end:cpt-template-site-meta-algo-head-sync-head-tags:p1:inst-twitter-tags
  // @cpt-begin:cpt-template-site-meta-algo-head-sync-head-tags:p1:inst-twitter-image
  if (ogImage) tags.push({ kind: 'meta-name', key: 'twitter:image', value: ogImage });
  if (ogImage && map.ogImageAlt) tags.push({ kind: 'meta-name', key: 'twitter:image:alt', value: map.ogImageAlt });
  // @cpt-end:cpt-template-site-meta-algo-head-sync-head-tags:p1:inst-twitter-image
  // @cpt-begin:cpt-template-site-meta-algo-head-sync-head-tags:p1:inst-return-tags
  return tags;
  // @cpt-end:cpt-template-site-meta-algo-head-sync-head-tags:p1:inst-return-tags
}

// @cpt-begin:cpt-template-site-meta-algo-head-sync-apply-head:p1:inst-tag-selector
function selectorFor(tag: HeadTag): string {
  if (tag.kind === 'link-rel') return `link[rel="${tag.key}"]`;
  return tag.kind === 'meta-name' ? `meta[name="${tag.key}"]` : `meta[property="${tag.key}"]`;
}
// @cpt-end:cpt-template-site-meta-algo-head-sync-apply-head:p1:inst-tag-selector

/**
 * Writes one page's head: the document title, and every tag of `headTagsFor`, each updated in place when present (the static head of `dist/index.html` already carries them) or added. An image tag (`og:image`, `twitter:image` and their alternative texts) the page does not have is removed.
 * @param doc - the document to write
 * @param map - the site's page map
 * @param page - the page the address shows
 */
// @cpt-algo:cpt-template-site-meta-algo-head-sync-apply-head:p1
export function applyHead(doc: Document, map: SiteMetaMap, page: PageMeta): void {
  // @cpt-begin:cpt-template-site-meta-algo-head-sync-apply-head:p1:inst-set-title
  doc.title = page.documentTitle;
  // @cpt-end:cpt-template-site-meta-algo-head-sync-apply-head:p1:inst-set-title
  // @cpt-begin:cpt-template-site-meta-algo-head-sync-apply-head:p1:inst-foreach-tag
  const tags = headTagsFor(map, page);
  for (const tag of tags) {
    // @cpt-begin:cpt-template-site-meta-algo-head-sync-apply-head:p1:inst-find-tag
    let node = doc.head.querySelector(selectorFor(tag));
    // @cpt-end:cpt-template-site-meta-algo-head-sync-apply-head:p1:inst-find-tag
    // @cpt-begin:cpt-template-site-meta-algo-head-sync-apply-head:p1:inst-if-absent-create
    if (!node) {
      node = doc.createElement(tag.kind === 'link-rel' ? 'link' : 'meta');
      if (tag.kind === 'link-rel') node.setAttribute('rel', tag.key);
      else node.setAttribute(tag.kind === 'meta-name' ? 'name' : 'property', tag.key);
      node.setAttribute(OWNED_ATTRIBUTE, '');
      doc.head.appendChild(node);
    }
    // @cpt-end:cpt-template-site-meta-algo-head-sync-apply-head:p1:inst-if-absent-create
    // @cpt-begin:cpt-template-site-meta-algo-head-sync-apply-head:p1:inst-set-value
    node.setAttribute(tag.kind === 'link-rel' ? 'href' : 'content', tag.value);
    // @cpt-end:cpt-template-site-meta-algo-head-sync-apply-head:p1:inst-set-value
  }
  // @cpt-end:cpt-template-site-meta-algo-head-sync-apply-head:p1:inst-foreach-tag
  // @cpt-begin:cpt-template-site-meta-algo-head-sync-apply-head:p1:inst-remove-stale-image-tags
  const present = new Set(tags.map((tag) => tag.key));
  for (const key of ['og:image', 'og:image:alt', 'twitter:image', 'twitter:image:alt']) {
    if (present.has(key)) continue;
    doc.head.querySelector(key.startsWith('og:') ? `meta[property="${key}"]` : `meta[name="${key}"]`)?.remove();
  }
  // @cpt-end:cpt-template-site-meta-algo-head-sync-apply-head:p1:inst-remove-stale-image-tags
}

// @cpt-begin:cpt-template-site-meta-flow-head-sync-visit-page:p1:inst-read-address
function addressOf(history: NavigationHistory): AddressParts {
  return { path: history.location.path, search: history.location.search, hash: history.location.hash };
}
// @cpt-end:cpt-template-site-meta-flow-head-sync-visit-page:p1:inst-read-address

/**
 * Starts head-sync in a window: the head follows the realm's navigation history (the singleton the framework router writes through), now and on every navigation. At the bare shell root the head is the home page's (`resolvePage`); the shell itself opens the home screen there.
 * @param win - the window to run in
 * @param map - the site's page map
 * @returns the release function of the history subscription
 */
// @cpt-flow:cpt-template-site-meta-flow-head-sync-visit-page:p1
// @cpt-dod:cpt-template-site-meta-dod-head-sync-follow-address:p1
export function startHeadSync(win: Window, map: SiteMetaMap): () => void {
  // @cpt-begin:cpt-template-site-meta-flow-head-sync-visit-page:p1:inst-resolve-history
  const history = resolveNavigationHistory();
  // @cpt-end:cpt-template-site-meta-flow-head-sync-visit-page:p1:inst-resolve-history
  // @cpt-begin:cpt-template-site-meta-flow-head-sync-visit-page:p1:inst-apply-now
  const sync = () => applyHead(win.document, map, resolvePage(map, addressOf(history)));
  sync();
  // @cpt-end:cpt-template-site-meta-flow-head-sync-visit-page:p1:inst-apply-now
  // @cpt-begin:cpt-template-site-meta-flow-head-sync-visit-page:p1:inst-follow-history
  return history.subscribe(sync);
  // @cpt-end:cpt-template-site-meta-flow-head-sync-visit-page:p1:inst-follow-history
}
