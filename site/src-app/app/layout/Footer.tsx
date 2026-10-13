/**
 * Footer Component
 *
 * The site footer: the Constructor Fabric lockup without the badge, linking to the home screen, then the source repositories and the screens `site.config.json` names in `footerScreens` (route tokens, so the layout names no screen), in one row; the screens `inkFooterScreens` names get the ink variant, as V2's showcase footer. Rendered while the layout state keeps it visible (`app.actions.setFooterVisible`).
 */

import React from 'react';
import { useAppSelector, useTranslation, type FooterState } from '@gears-frontx/react';
import { activeScreen, documentHref, homeScreen, isPlainClick, screenByToken, type NavEntry, type NavScreen } from './navigation';
import { HOME_SCREEN_TOKEN } from './home';
import { layoutKey } from './i18n';
import { FOOTER_SCREENS, INK_FOOTER_SCREENS } from './site';
import { BrandLockup } from './ui/BrandLockup';
import { FooterFrame, FooterLink, FooterLinks } from './ui/FooterFrame';

/** The source repositories of FrontX and its official templates: the visible label is short, the rest of the name is read out only. */
export const SOURCE_LINKS = [
  { key: 'footer.repoFrontx', detailKey: 'footer.repoFrontxDetail', href: 'https://github.com/constructorfabric/gears-frontx' },
  { key: 'footer.repoTemplates', detailKey: 'footer.repoTemplatesDetail', href: 'https://github.com/constructorfabric/gears-frontx-templates' },
] as const;

export interface FooterProps {
  entries: NavEntry[] | undefined;
  onOpen: (extensionId: string) => void;
}

/** The label of a footer screen link: the layout strings may name it (`footer.screens.<token>`), otherwise the screen's own menu label. */
function screenLabel(t: (key: string) => string, screen: NavScreen): string {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-footer
  const key = layoutKey(`footer.screens.${screen.token}`);
  const label = t(key);
  return label === key ? screen.label : label;
  // @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-footer
}

// @cpt-algo:cpt-site-algo-shell-layout-navigation-page-frame:p1
// @cpt-flow:cpt-site-flow-shell-layout-navigation-open-screen:p1
export const Footer: React.FC<FooterProps> = ({ entries, onOpen }) => {
  const footerState = useAppSelector((state) => state['layout/footer'] as FooterState | undefined);
  const { t } = useTranslation();
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-if-footer-hidden
  if (footerState?.visible === false) return null;
  // @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-if-footer-hidden

  // @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-footer
  const screens = FOOTER_SCREENS.flatMap((token) => {
    const screen = entries ? screenByToken(entries, token) : undefined;
    return screen ? [screen] : [];
  });

  const home = entries ? homeScreen(entries, HOME_SCREEN_TOKEN) : undefined;
  const active = entries ? activeScreen(entries) : undefined;
  const ink = active !== undefined && INK_FOOTER_SCREENS.includes(active.token);

  return (
    <FooterFrame
      ink={ink}
      brand={
        <BrandLockup
          compact
          href={home?.href ?? documentHref('/')}
          label={t(layoutKey('brandHome'))}
          company={t(layoutKey('brandCompany'))}
          product={t(layoutKey('brand'))}
          onClick={(event) => {
            // @cpt-begin:cpt-site-flow-shell-layout-navigation-open-screen:p1:inst-if-modified-click
            if (!home || !isPlainClick(event)) return;
            // @cpt-end:cpt-site-flow-shell-layout-navigation-open-screen:p1:inst-if-modified-click
            // @cpt-begin:cpt-site-flow-shell-layout-navigation-open-screen:p1:inst-open-clicked
            event.preventDefault();
            onOpen(home.id);
            // @cpt-end:cpt-site-flow-shell-layout-navigation-open-screen:p1:inst-open-clicked
          }}
        />
      }
    >
      <FooterLinks label={t(layoutKey('footer.label'))}>
        {SOURCE_LINKS.map((link) => (
          <FooterLink key={link.href} href={link.href} detail={t(layoutKey(link.detailKey))} external>
            {t(layoutKey(link.key))}
          </FooterLink>
        ))}
        {screens.map((screen) => (
          <FooterLink
            key={screen.id}
            href={screen.href}
            onClick={(event) => {
              // @cpt-begin:cpt-site-flow-shell-layout-navigation-open-screen:p1:inst-if-modified-click
              if (!isPlainClick(event)) return;
              // @cpt-end:cpt-site-flow-shell-layout-navigation-open-screen:p1:inst-if-modified-click
              // @cpt-begin:cpt-site-flow-shell-layout-navigation-open-screen:p1:inst-open-clicked
              event.preventDefault();
              onOpen(screen.id);
              // @cpt-end:cpt-site-flow-shell-layout-navigation-open-screen:p1:inst-open-clicked
            }}
          >
            {screenLabel(t, screen)}
          </FooterLink>
        ))}
      </FooterLinks>
    </FooterFrame>
  );
  // @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-footer
};

Footer.displayName = 'Footer';
