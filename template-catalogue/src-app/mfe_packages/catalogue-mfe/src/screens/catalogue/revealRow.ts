/**
 * Brings a navigation row into sight by scrolling the panel's own rows, and nothing else.
 *
 * `Element.scrollIntoView` scrolls every scrolling ancestor, the document included. Until the page scrolls, the sticky panel starts below the tab bar and runs past the bottom of the viewport, so a current row near the end of the first screenful (Input at 1440x900) sat inside the panel but under the viewport's edge, and `block: 'nearest'` scrolled the whole page to show it. The visible part of the panel is therefore its box clipped to the viewport, and only the panel's `scrollTop` moves.
 * @param panel - the scrolling navigation panel
 * @param row - the row to show
 * @param viewportHeight - the height of the viewport the panel is clipped to
 */
// @cpt-algo:cpt-template-catalogue-algo-catalogue-screen-reveal-row:p2
export function revealRow(panel: HTMLElement, row: HTMLElement, viewportHeight: number): void {
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-reveal-row:p2:inst-visible-part
  const box = panel.getBoundingClientRect();
  const target = row.getBoundingClientRect();
  const top = Math.max(box.top, 0);
  const bottom = Math.min(box.bottom, viewportHeight);
  // @cpt-end:cpt-template-catalogue-algo-catalogue-screen-reveal-row:p2:inst-visible-part
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-reveal-row:p2:inst-scroll-up
  if (target.top < top) {
    panel.scrollTop -= top - target.top;
  // @cpt-end:cpt-template-catalogue-algo-catalogue-screen-reveal-row:p2:inst-scroll-up
  } else if (target.bottom > bottom) {
    // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-reveal-row:p2:inst-scroll-down
    // A row taller than the visible part keeps its top in sight rather than its bottom.
    panel.scrollTop += Math.min(target.bottom - bottom, target.top - top);
    // @cpt-end:cpt-template-catalogue-algo-catalogue-screen-reveal-row:p2:inst-scroll-down
  }
}
