/**
 * Light theme for FrontX: the `@gears-frontx/ui-kit` light token set.
 *
 * The kit's theme.css declares every token for both appearances and selects them on `data-theme`, which the theme registry writes on the document element from `appearance`. The theme therefore carries no variables of its own: one palette, the kit's, paints the shell and every screen.
 */

import type { ThemeConfig } from '@gears-frontx/react';

// @cpt-algo:cpt-site-algo-shell-layout-navigation-look-and-strings:p1
// @cpt-begin:cpt-site-algo-shell-layout-navigation-look-and-strings:p1:inst-declare-themes
export const LIGHT_THEME_ID = 'light' as const;

export const lightTheme: ThemeConfig = {
  id: LIGHT_THEME_ID,
  name: 'Light',
  appearance: 'light',
  default: true,
  variables: {},
};
// @cpt-end:cpt-site-algo-shell-layout-navigation-look-and-strings:p1:inst-declare-themes
