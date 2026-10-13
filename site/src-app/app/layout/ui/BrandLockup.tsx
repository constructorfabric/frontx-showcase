import type { MouseEvent } from 'react';
import { Badge } from '@gears-frontx/ui-kit';
import { Link } from '@gears-frontx/kit-candidates';
import logoSrc from '@gears-frontx/site-brand/assets/constructor-weave.svg';
import styles from './BrandLockup.module.css';

export interface BrandLockupProps {
  href: string;
  /** The link's accessible name. */
  label: string;
  /** The company name before the divider. */
  company: string;
  /** The product wordmark after the divider; its last letter takes the brand blue. */
  product: string;
  /** The badge after the wordmark (the header's); the footer's lockup carries none. */
  badge?: string;
  /** The footer's smaller lockup. */
  compact?: boolean;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

/** The Constructor Fabric lockup as one link to the home screen, on the kit candidate `Link`: the logo (the brand template's asset), company name, divider and product wordmark, with an optional badge on the kit's Badge right after it. The wordmark's size and ink are the brand's lockup values, recorded in the shell chrome's exemptions ledger. */
// @cpt-algo:cpt-site-algo-shell-layout-navigation-page-frame:p1
export function BrandLockup({ href, label, company, product, badge, compact = false, onClick }: BrandLockupProps) {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-header
  // The wordmark's type and ink sit on the frame; the kit candidate `Link` inherits its line's font and, in its `inherit` variant, its colour.
  return (
    <span className={compact ? `${styles.frame} ${styles.compact}` : styles.frame}>
      <Link variant="inherit" className={styles.lockup} href={href} aria-label={label} onClick={onClick}>
        <img className={styles.logo} src={logoSrc} width={30} height={30} alt="" />
        <span>{company}</span>
        <span className={styles.divider} aria-hidden="true">
          /
        </span>
        <span>
          {product.slice(0, -1)}
          <span className={styles.accent}>{product.slice(-1)}</span>
        </span>
      </Link>
      {/* The badge sits beside the link, not in it: its 10px label is decoration, and inside the link it would be interactive text under the 12px control floor. */}
      {badge ? (
        <Badge className={styles.badge} variant="accent" size="xs">
          {badge}
        </Badge>
      ) : null}
    </span>
  );
  // @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-header
}
