/**
 * Sidebar Component
 *
 * Right-side panel for contextual content, shown while the layout state keeps it visible.
 */

import React from 'react';
import { useAppSelector, type SidebarState } from '@gears-frontx/react';
import styles from './Sidebar.module.css';

export interface SidebarProps {
  children?: React.ReactNode;
}

// @cpt-algo:cpt-site-algo-shell-layout-navigation-page-frame:p1
export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-main
  const sidebarState = useAppSelector((state) => state['layout/sidebar'] as SidebarState | undefined);

  const visible = sidebarState?.visible ?? false;
  const collapsed = sidebarState?.collapsed ?? true;

  if (!visible) {
    return null;
  }

  return (
    <aside className={collapsed ? styles.collapsed : styles.sidebar}>
      <div className={styles.content}>{children}</div>
    </aside>
  );
  // @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-main
};

Sidebar.displayName = 'Sidebar';
