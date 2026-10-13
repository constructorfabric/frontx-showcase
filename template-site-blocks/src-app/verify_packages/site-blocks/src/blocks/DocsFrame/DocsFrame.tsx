import type { ReactElement, ReactNode } from 'react';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@gears-frontx/ui-kit';

import { PageIntro, type PageIntroProps } from '../PageIntro/PageIntro';
import styles from './DocsFrame.module.css';

export interface DocsNavItem {
  /** A stable key for the item. */
  id: string;
  label: string;
  /** The item is the page on screen. */
  current: boolean;
  /** The anchor the item renders as, such as the router's link element; the label becomes its content. */
  render: ReactElement;
}

export interface DocsNav {
  /** The navigation landmark's name. */
  label: string;
  items: readonly DocsNavItem[];
}

export interface DocsFrameProps {
  /** The page intro: title, lead, back link and facts. */
  intro: PageIntroProps;
  /** The tab bar across the pages of a section, under the intro. */
  nav?: DocsNav;
  /** Content across the whole column above the body, such as leading cards. */
  wide?: ReactNode;
  /** The page's body. */
  children: ReactNode;
  /** A small line under the body, such as the link to the page's plain-text twin. */
  footer?: ReactNode;
}

// @cpt-dod:cpt-template-site-blocks-dod-docs-blocks-docs-frame:p1
// @cpt-algo:cpt-template-site-blocks-algo-docs-blocks-docs-frame:p1
/** The tab bar of a docs section: the kit's navigation menu with one plain link per page, the current one marked active. */
export function DocsTabs({ label, items }: DocsNav) {
  // @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-docs-frame:p1:inst-tabs
  return (
    <NavigationMenu aria-label={label} className={styles.tabs}>
      <NavigationMenuList className={styles.tabList}>
        {items.map((item) => (
          <NavigationMenuItem key={item.id}>
            <NavigationMenuLink active={item.current} render={item.render}>
              {item.label}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
  // @cpt-end:cpt-template-site-blocks-algo-docs-blocks-docs-frame:p1:inst-tabs
}

/*
 * The frame of an inner page: the page column with the intro, the optional tab bar, content across the whole column, the body and a footer line, one under the other.
 */
export function DocsFrame({ intro, nav, wide, children, footer }: DocsFrameProps) {
  // @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-docs-frame:p1:inst-column
  return (
    <article className={styles.page}>
      <PageIntro {...intro} />
      <div className={styles.content}>
        {nav ? <DocsTabs {...nav} /> : null}
        {wide}
        <div className={styles.body}>{children}</div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </article>
  );
  // @cpt-end:cpt-template-site-blocks-algo-docs-blocks-docs-frame:p1:inst-column
}
