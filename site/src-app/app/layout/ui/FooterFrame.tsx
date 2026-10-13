import type { MouseEvent, ReactNode } from 'react';
import { Link, Text, VisuallyHidden } from '@gears-frontx/kit-candidates';
import styles from './FooterFrame.module.css';

export interface FooterFrameProps {
  /** The brand lockup at the start. */
  brand: ReactNode;
  /** A `FooterLinks` list. */
  children: ReactNode;
  /** V2's showcase footer: ink links, and on a phone left-aligned wrapping rows instead of a centred stack. */
  ink?: boolean;
}

/** The site footer frame of the designer's V2 site: the lockup at the start and one row of links at the end, stacked and centred on narrow screens (or, in the ink variant, wrapped and left-aligned). Fills the kit gap "site footer". */
// @cpt-algo:cpt-site-algo-shell-layout-navigation-page-frame:p1
export function FooterFrame({ brand, children, ink = false }: FooterFrameProps) {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-footer
  return (
    <footer className={ink ? `${styles.footer} ${styles.ink}` : styles.footer} data-variant={ink ? 'ink' : undefined}>
      {brand}
      {children}
    </footer>
  );
  // @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-footer
}

export interface FooterLinksProps {
  /** The list's accessible name; no visible heading is drawn. */
  label: string;
  /** `FooterLink`s. */
  children: ReactNode;
}

/** The footer's navigation list, on the kit candidate `Text` meta role. Fills the kit gap "footer link list". */
export function FooterLinks({ label, children }: FooterLinksProps) {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-footer
  return (
    <nav aria-label={label}>
      <Text variant="meta" className={styles.links} render={<ul />}>
        {children}
      </Text>
    </nav>
  );
  // @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-footer
}

export interface FooterLinkProps {
  href: string;
  children: ReactNode;
  /** Read out after the visible label, for a label that is short on screen ("GitHub"). */
  detail?: string;
  /** A link off the site: marked with the Link's arrow; it opens in the same tab, as every link of the site does. */
  external?: boolean;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

/** One link of the footer list: the kit candidate `Link`, its read-out detail in `VisuallyHidden`. */
export function FooterLink({ href, children, detail, external = false, onClick }: FooterLinkProps) {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-footer
  return (
    <li>
      <Link variant="muted" className={styles.link} href={href} external={external} target={external ? '_self' : undefined} rel={external ? 'noopener' : undefined} onClick={onClick}>
        {children}
        {detail ? <VisuallyHidden>: {detail}</VisuallyHidden> : null}
      </Link>
    </li>
  );
  // @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-footer
}
