import type { ReactElement } from 'react';

/*
 * The class name a kit part computes for the given props. Card, CardTitle,
 * EmptyTitle and AlertTitle (ui-kit 0.4.0) are plain functions with no hooks
 * that return one `div` element; calling one as a function reads the class
 * it would put on that `div` (its CSS Module classes plus the caller's)
 * without rendering it. That keeps a candidate on the installed kit's own
 * stylesheet instead of a copy of it. It rests on the parts staying
 * hook-free, single-element functions; the candidates' tests compare their
 * markup with the kit's and fail when that stops holding.
 */
// @cpt-dod:cpt-template-kit-candidates-dod-code-and-description-render-on-parts:p1
// @cpt-algo:cpt-template-kit-candidates-algo-code-and-description-render-part:p1
export function kitClassName<P extends { className?: string }>(part: (props: P) => ReactElement, props: P): string {
  // @cpt-begin:cpt-template-kit-candidates-algo-code-and-description-render-part:p1:inst-kit-class
  const element = part(props) as ReactElement<{ className?: string }>;
  return element.props.className ?? '';
  // @cpt-end:cpt-template-kit-candidates-algo-code-and-description-render-part:p1:inst-kit-class
}
