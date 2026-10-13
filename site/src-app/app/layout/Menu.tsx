/**
 * Menu Component
 *
 * The site's main navigation in the header: one entry per registered screen extension, in `presentation.order`, and one entry per `presentation.group` that lists the screens declaring it. Built from `@gears-frontx/ui-kit`'s NavigationMenu. Every item is a real link to the screen's canonical address; a plain click mounts the screen through the screen domain's `mount_ext` action instead of reloading the page, and the framework router writes the address.
 */

import React from 'react';
import { useTranslation } from '@gears-frontx/react';
import { NavGroup, NavLink, NavMenu, NavMenuItem } from './ui/NavMenu';
import { isPlainClick, type NavEntry, type NavScreen } from './navigation';
import { layoutKey } from './i18n';

/**
 * Test id of the menu item that opens `extensionId`.
 *
 * A verification API, not a styling hook: an unattended browser run clicks screens through it, so the value is part of what the host promises. The extension id goes in verbatim: it is the identity the registry keys on, so two items cannot share one, and a slug step could fold `a.b` and `a-b` together.
 */
export const menuItemTestId = (extensionId: string): string => `menu-item-${extensionId}`;

export interface MenuProps {
  entries: NavEntry[] | undefined;
  onOpen: (extensionId: string) => void;
}

/** Title-cases a group token for a group the layout strings do not name. */
const groupFallbackLabel = (group: string): string => group.charAt(0).toUpperCase() + group.slice(1);

function ScreenLink({ screen, onOpen, grouped = false }: { screen: NavScreen; onOpen: (id: string) => void; grouped?: boolean }) {
  return (
    <NavLink
      href={screen.href}
      active={screen.active}
      label={screen.label}
      grouped={grouped}
      data-testid={menuItemTestId(screen.id)}
      onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
        // @cpt-begin:cpt-site-flow-shell-layout-navigation-open-screen:p1:inst-if-modified-click
        if (!isPlainClick(event)) return;
        // @cpt-end:cpt-site-flow-shell-layout-navigation-open-screen:p1:inst-if-modified-click
        // @cpt-begin:cpt-site-flow-shell-layout-navigation-open-screen:p1:inst-open-clicked
        event.preventDefault();
        onOpen(screen.id);
        // @cpt-end:cpt-site-flow-shell-layout-navigation-open-screen:p1:inst-open-clicked
      }}
    />
  );
}

// @cpt-algo:cpt-site-algo-shell-layout-navigation-page-frame:p1
// @cpt-flow:cpt-site-flow-shell-layout-navigation-open-screen:p1
export const Menu: React.FC<MenuProps> = ({ entries, onOpen }) => {
  const { t } = useTranslation();
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-menu
  // Before bootstrap settles the list is unknown and the navigation stays empty.
  if (!entries) return <NavMenu label={t(layoutKey('nav.label'))} />;

  // Every group closes when the mounted screen changes, whatever opened the screen.
  const activeId = entries.flatMap((entry) => (entry.kind === 'screen' ? [entry] : entry.items)).find((screen) => screen.active)?.id;

  return (
    <NavMenu label={t(layoutKey('nav.label'))}>
      {entries.map((entry) =>
        entry.kind === 'screen' ? (
          <NavMenuItem key={entry.id}>
            <ScreenLink screen={entry} onOpen={onOpen} />
          </NavMenuItem>
        ) : (
          <NavGroup key={`group:${entry.id}`} label={translatedGroupLabel(t, entry.id)} active={entry.active} closeKey={activeId} data-testid={`menu-group-${entry.id}`}>
            {entry.items.map((item) => (
              <li key={item.id}>
                <ScreenLink screen={item} onOpen={onOpen} grouped />
              </li>
            ))}
          </NavGroup>
        )
      )}
    </NavMenu>
  );
  // @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-menu
};

/** The group's label from the layout strings, or its token title-cased when they name none. */
function translatedGroupLabel(t: (key: string) => string, group: string): string {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-menu
  const key = layoutKey(`nav.groups.${group}`);
  const label = t(key);
  return label === key ? groupFallbackLabel(group) : label;
  // @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-menu
}

Menu.displayName = 'Menu';
