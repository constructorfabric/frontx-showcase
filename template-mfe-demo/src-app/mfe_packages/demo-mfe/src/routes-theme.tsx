import { CurrentThemeScreen } from './screens/theme/CurrentThemeScreen';
import { createScreenRouteTree } from './shared/screenRoutes';

// @cpt-dod:cpt-template-mfe-demo-dod-screen-entries-entries:p1
// @cpt-algo:cpt-template-mfe-demo-algo-screen-entries-screen-route-tree:p1
// @cpt-begin:cpt-template-mfe-demo-algo-screen-entries-screen-route-tree:p1:inst-per-entry-tree
/** The Current Theme screen's routes inside its entry: `/` renders the screen; any other path renders the not-found page. */
export const themeRouteTree = createScreenRouteTree(CurrentThemeScreen);
// @cpt-end:cpt-template-mfe-demo-algo-screen-entries-screen-route-tree:p1:inst-per-entry-tree
