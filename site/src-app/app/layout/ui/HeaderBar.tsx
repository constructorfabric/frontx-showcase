import type { ReactNode } from 'react';
import { Link } from '@gears-frontx/kit-candidates';
import styles from './HeaderBar.module.css';

export interface HeaderBarProps {
  /** The brand lockup at the start. */
  brand: ReactNode;
  /** The main navigation, pushed to the end of the row. */
  nav: ReactNode;
  /** A plain link after the navigation (the source repository), drawn with the kit candidate `Link`; not shown on narrow screens. */
  link: { href: string; label: string };
  /** Controls after the link (the language select, shown only while the site ships more than one language). */
  controls?: ReactNode;
}

/** The sticky site header frame of the designer's V2 site: the lockup at the start, then the navigation and the actions at the end; from 900px down the navigation takes its own row under the lockup, and from 640px down the source link is left out. Fills the kit gap "site header". */
// @cpt-algo:cpt-site-algo-shell-layout-navigation-page-frame:p1
export function HeaderBar({ brand, nav, link, controls }: HeaderBarProps) {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-header
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {brand}
        <div className={styles.navArea}>{nav}</div>
        <div className={styles.actions}>
          <Link variant="muted" className={styles.link} href={link.href} rel="noopener">
            {link.label}
          </Link>
          {controls}
        </div>
      </div>
    </header>
  );
  // @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-header
}
