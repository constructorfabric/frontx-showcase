/**
 * Dark theme for FrontX: the `@gears-frontx/ui-kit` dark token set, selected through `data-theme="dark"` on the document element (see `light.ts`).
 */

import type { ThemeConfig } from '@gears-frontx/react';

// @cpt-algo:cpt-site-algo-shell-layout-navigation-look-and-strings:p1
// @cpt-begin:cpt-site-algo-shell-layout-navigation-look-and-strings:p1:inst-declare-themes
export const DARK_THEME_ID = 'dark' as const;

export const darkTheme: ThemeConfig = {
  id: DARK_THEME_ID,
  name: 'Dark',
  appearance: 'dark',
  variables: {},
};
// @cpt-end:cpt-site-algo-shell-layout-navigation-look-and-strings:p1:inst-declare-themes
