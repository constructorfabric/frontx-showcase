import type { ThemeConfig } from '@gears-frontx/react';
import { lightTheme, LIGHT_THEME_ID } from './light';
import { darkTheme } from './dark';

// @cpt-algo:cpt-site-algo-shell-layout-navigation-look-and-strings:p1
// @cpt-begin:cpt-site-algo-shell-layout-navigation-look-and-strings:p1:inst-declare-themes
export const DEFAULT_THEME_ID = LIGHT_THEME_ID;

export const frontxThemes: ThemeConfig[] = [lightTheme, darkTheme];
// @cpt-end:cpt-site-algo-shell-layout-navigation-look-and-strings:p1:inst-declare-themes
