// @cpt-flow:cpt-template-site-flow-site-links-jump-to-heading:p2
// @cpt-dod:cpt-template-site-dod-site-links-heading-jumps:p2
/**
 * Moves the view to a heading of the page and puts keyboard focus on it, so the next Tab continues from that section instead of from the control that was used to get there. The heading is made focusable by its `tabIndex={-1}`; `preventScroll` leaves the scrolling to `scrollIntoView`, which can animate.
 * @param from - any node of the page; its root is the document or the screen's shadow root
 * @param id - the heading's id
 */
export function jumpToHeading(from: Node, id: string): void {
  // @cpt-begin:cpt-template-site-flow-site-links-jump-to-heading:p1:inst-resolve-root
  const root = from.getRootNode();
  if (!(root instanceof ShadowRoot || root instanceof Document)) return;
  // @cpt-end:cpt-template-site-flow-site-links-jump-to-heading:p1:inst-resolve-root
  // @cpt-begin:cpt-template-site-flow-site-links-jump-to-heading:p1:inst-find-heading
  const heading = root.getElementById(id);
  if (!heading) return;
  // @cpt-end:cpt-template-site-flow-site-links-jump-to-heading:p1:inst-find-heading
  // @cpt-begin:cpt-template-site-flow-site-links-jump-to-heading:p1:inst-scroll-heading
  // jsdom and some embedded views have no scrollIntoView; the focus move is the part that must always happen.
  if (typeof heading.scrollIntoView === 'function') heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // @cpt-end:cpt-template-site-flow-site-links-jump-to-heading:p1:inst-scroll-heading
  // @cpt-begin:cpt-template-site-flow-site-links-jump-to-heading:p1:inst-focus-heading
  heading.focus({ preventScroll: true });
  // @cpt-end:cpt-template-site-flow-site-links-jump-to-heading:p1:inst-focus-heading
}
