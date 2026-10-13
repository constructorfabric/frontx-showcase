/**
 * Screen Component
 *
 * The document's main landmark, holding the screen domain's slot. It is the skip link's target: a screen renders in a shadow root, so the link focuses this container in the document, and the next Tab enters the screen.
 */

import React from 'react';
import styles from './Screen.module.css';

/** The id of the main landmark, the skip link's target. */
export const SCREEN_ID = 'content';

export interface ScreenProps {
  children?: React.ReactNode;
}

// @cpt-algo:cpt-site-algo-shell-layout-navigation-page-frame:p1
export const Screen: React.FC<ScreenProps> = ({ children }) => {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-main
  return (
    <main id={SCREEN_ID} tabIndex={-1} className={styles.screen}>
      {children}
    </main>
  );
  // @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-main
};

Screen.displayName = 'Screen';
