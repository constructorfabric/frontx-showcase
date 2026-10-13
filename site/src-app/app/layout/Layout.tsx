/**
 * Layout Component
 *
 * The page frame: the skip link to the screen, header with the site navigation, the screen area with the optional right sidebar, and the footer, plus the popup and overlay layers. The header shows no user, so the layout does not fetch the current user's record. The navigation entries are read once here from the registered screen extensions and shared by the header and the footer.
 */

import React from 'react';
import { useTranslation } from '@gears-frontx/react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { Screen, SCREEN_ID } from './Screen';
import { Popup } from './Popup';
import { Overlay } from './Overlay';
import { useScreenNavigation } from './useScreenNavigation';
import { layoutKey } from './i18n';
import { SkipLink } from './ui/SkipLink';
import styles from './Layout.module.css';

export interface LayoutProps {
  children?: React.ReactNode;
}

// @cpt-dod:cpt-site-dod-shell-layout-navigation-page-frame:p1
// @cpt-algo:cpt-site-algo-shell-layout-navigation-page-frame:p1
// @cpt-flow:cpt-site-flow-shell-layout-navigation-open-screen:p1
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  // @cpt-begin:cpt-site-flow-shell-layout-navigation-open-screen:p1:inst-share-entries
  const { entries, open } = useScreenNavigation();
  // @cpt-end:cpt-site-flow-shell-layout-navigation-open-screen:p1:inst-share-entries
  const { t } = useTranslation();

  return (
    <div className={styles.layout}>
      {/* @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-skip-link */}
      <SkipLink targetId={SCREEN_ID} label={t(layoutKey('skipToContent'))} />
      {/* @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-skip-link */}
      {/* @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-header */}
      <Header entries={entries} onOpen={open} />
      {/* @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-header */}
      {/* @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-main */}
      <div className={styles.body}>
        <Screen>{children}</Screen>
        <Sidebar />
      </div>
      {/* @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-main */}
      {/* @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-footer */}
      <Footer entries={entries} onOpen={open} />
      {/* @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-footer */}
      {/* @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-popup-overlay */}
      <Popup />
      <Overlay />
      {/* @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-popup-overlay */}
    </div>
  );
};

Layout.displayName = 'Layout';
