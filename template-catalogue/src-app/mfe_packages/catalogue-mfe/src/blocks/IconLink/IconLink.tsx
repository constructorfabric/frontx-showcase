import type { ReactNode } from 'react';
import { Link, Text, type LinkProps } from '@gears-frontx/kit-candidates';
import styles from './IconLink.module.css';

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export interface IconLinkProps extends Omit<LinkProps, 'children' | 'className'> {
  /** An icon before the text (a lucide icon with its `size`). */
  icon?: ReactNode;
  /** An icon after the text, such as an arrow. */
  trailingIcon?: ReactNode;
  testId?: string;
  children: ReactNode;
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

/** A link of the catalogue's meta size with icons around its text: the kit-candidate `Link` (its `variant`, `render` and anchor props pass through) on the `meta` text role. */
// @cpt-dod:cpt-template-catalogue-dod-catalogue-screen-blocks:p1
// @cpt-algo:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1
export function IconLink({ icon, trailingIcon, testId, children, ...link }: IconLinkProps) {
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text
  return (
    <Text variant="meta" render={<span />} className={styles.line}>
      {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
      {/* @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-link */}
      <Link {...link} className={styles.link} data-testid={testId}>
        {icon}
        <span>{children}</span>
        {trailingIcon}
      </Link>
      {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-link */}
    </Text>
  );
}
