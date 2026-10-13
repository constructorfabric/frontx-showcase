import { cloneElement, createElement, type AnchorHTMLAttributes, type ReactElement, type Ref } from 'react';

/** The element a block's link is drawn on: a router's link (`<Link to="/" />`), whose own props the block's merge over, or nothing for a plain anchor. */
// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export type AnchorRender = ReactElement<AnchorHTMLAttributes<HTMLAnchorElement> & { ref?: Ref<HTMLAnchorElement> }>;
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export type BlockAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Draws the link on this element instead of a plain anchor. */
  render?: AnchorRender;
  ref?: Ref<HTMLAnchorElement>;
  [data: `data-${string}`]: string | undefined;
};
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

/** A block's link: a plain anchor, or the given router link with the block's props merged over its own, so routing stays with the composition. */
// @cpt-algo:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1
export function BlockAnchor({ render, ...props }: BlockAnchorProps) {
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-link
  return render ? cloneElement(render, props) : createElement('a', props);
  // @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-link
}
