/**
 * Header Component
 *
 * The site header: the Constructor Fabric lockup linking to the home screen, the main navigation built from the registered screens (without the groups `site.config.json` names in `headerHiddenGroups`), the source repository link and the language select (only while the site ships more than one language). It offers no theme choice: the site renders the light theme, its default (architecture/DESIGN.md section 4.3.4); theme stays a FrontX shared property every screen receives, set through the framework's theme registry.
 */

import React from 'react';
import { useTranslation, SUPPORTED_LANGUAGES } from '@gears-frontx/react';
import { SOURCE_LINKS } from './Footer';
import { Menu } from './Menu';
import { documentHref, homeScreen, isPlainClick, withoutGroups, type NavEntry } from './navigation';
import { HOME_SCREEN_TOKEN } from './home';
import { layoutKey } from './i18n';
import { HEADER_HIDDEN_GROUPS, offeredLanguages, SITE_LANGUAGES } from './site';
import { BrandLockup } from './ui/BrandLockup';
import { HeaderBar } from './ui/HeaderBar';
import { HeaderSelect } from './ui/HeaderSelect';

export interface HeaderProps {
  entries: NavEntry[] | undefined;
  onOpen: (extensionId: string) => void;
}

/** The language select, offering only the languages the whole site ships; with one language there is nothing to choose and it is not shown. */
function LanguageSelect() {
  const { t, language, setLanguage } = useTranslation();
  const offered = offeredLanguages(SUPPORTED_LANGUAGES, SITE_LANGUAGES);
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-if-one-language
  if (offered.length < 2) return null;
  // @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-if-one-language
  return (
    <HeaderSelect
      label={t(layoutKey('controls.language'))}
      value={language ?? ''}
      options={offered.map((option) => ({ value: option.code, label: option.name }))}
      onChange={(code) => {
        const chosen = offered.find((option) => option.code === code);
        if (chosen) void setLanguage(chosen.code);
      }}
      data-testid="header-language"
    />
  );
}

// @cpt-algo:cpt-site-algo-shell-layout-navigation-page-frame:p1
// @cpt-flow:cpt-site-flow-shell-layout-navigation-open-screen:p1
export const Header: React.FC<HeaderProps> = ({ entries, onOpen }) => {
  const { t } = useTranslation();
  const home = entries ? homeScreen(entries, HOME_SCREEN_TOKEN) : undefined;
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-header
  return (
    <HeaderBar
      brand={
        <BrandLockup
          href={home?.href ?? documentHref('/')}
          label={t(layoutKey('brandHome'))}
          company={t(layoutKey('brandCompany'))}
          product={t(layoutKey('brand'))}
          badge={t(layoutKey('brandBadge'))}
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
      nav={<Menu entries={entries && withoutGroups(entries, HEADER_HIDDEN_GROUPS)} onOpen={onOpen} />}
      link={{ href: SOURCE_LINKS[0].href, label: t(layoutKey('nav.github')) }}
      controls={<LanguageSelect />}
    />
  );
  // @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-header
};

Header.displayName = 'Header';
