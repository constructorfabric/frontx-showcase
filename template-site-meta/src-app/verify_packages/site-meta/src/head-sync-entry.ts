/**
 * The browser entry esbuild bundles into the inline head-sync script: reads the page map from the inert JSON node the generator writes beside it, then starts head-sync.
 */
import { MAP_ELEMENT_ID, startHeadSync } from './head-sync.ts';
import type { SiteMetaMap } from './page-map.ts';

// @cpt-flow:cpt-template-site-meta-flow-head-sync-visit-page:p1
// @cpt-begin:cpt-template-site-meta-flow-head-sync-visit-page:p1:inst-read-map-node
const node = document.getElementById(MAP_ELEMENT_ID);
// @cpt-end:cpt-template-site-meta-flow-head-sync-visit-page:p1:inst-read-map-node
// @cpt-begin:cpt-template-site-meta-flow-head-sync-visit-page:p1:inst-if-map-present
if (node?.textContent) {
  startHeadSync(window, JSON.parse(node.textContent) as SiteMetaMap);
}
// @cpt-end:cpt-template-site-meta-flow-head-sync-visit-page:p1:inst-if-map-present
