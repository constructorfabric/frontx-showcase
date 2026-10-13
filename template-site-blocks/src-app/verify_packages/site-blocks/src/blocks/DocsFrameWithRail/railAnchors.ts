/**
 * Which item of an "On this page" list is current: the last heading whose top has reached the reading line, or the first item while the page is still above every heading.
 * @param tops - each heading's top edge in viewport pixels, in page order
 * @param line - the reading line in viewport pixels, just under the sticky header
 */
// @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-rail-current:p1:inst-pick-current
export function activeAnchor(tops: readonly number[], line: number): number {
  let active = 0;
  tops.forEach((top, index) => {
    if (top <= line) active = index;
  });
  return active;
}
// @cpt-end:cpt-template-site-blocks-algo-docs-blocks-rail-current:p1:inst-pick-current

/**
 * Moves the view to a heading of the page and puts keyboard focus on it, so the next Tab continues from that section instead of from the control that was used to get there. The heading is focusable by its `tabIndex={-1}`; `preventScroll` leaves the scrolling to `scrollIntoView`, which can animate.
 * @param from - any node of the page; its root is the document or the screen's shadow root
 * @param id - the heading's id
 */
export function jumpToHeading(from: Node, id: string): void {
  // @cpt-begin:cpt-template-site-blocks-flow-docs-blocks-jump-to-section:p1:inst-find-heading
  const root = from.getRootNode();
  if (!(root instanceof ShadowRoot || root instanceof Document)) return;
  const heading = root.getElementById(id);
  if (!heading) return;
  // @cpt-end:cpt-template-site-blocks-flow-docs-blocks-jump-to-section:p1:inst-find-heading
  // @cpt-begin:cpt-template-site-blocks-flow-docs-blocks-jump-to-section:p1:inst-scroll-focus
  // jsdom and some embedded views have no scrollIntoView; the focus move is the part that must always happen.
  if (typeof heading.scrollIntoView === 'function') heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
  heading.focus({ preventScroll: true });
  // @cpt-end:cpt-template-site-blocks-flow-docs-blocks-jump-to-section:p1:inst-scroll-focus
}
