/**
 * Overlay Component
 *
 * Full-screen overlay for modal and loading states.
 */

import React from 'react';
import { useAppSelector, type OverlayState } from '@gears-frontx/react';
import styles from './Overlay.module.css';

export interface OverlayProps {
  children?: React.ReactNode;
}

// @cpt-algo:cpt-site-algo-shell-layout-navigation-page-frame:p1
export const Overlay: React.FC<OverlayProps> = ({ children }) => {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-popup-overlay
  const overlayState = useAppSelector((state) => state['layout/overlay'] as OverlayState | undefined);
  const visible = overlayState?.visible ?? false;

  if (!visible) {
    return null;
  }

  return <div className={styles.overlay}>{children}</div>;
  // @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-popup-overlay
};

Overlay.displayName = 'Overlay';
