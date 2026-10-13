import { createRootRoute, createRoute, Outlet } from '@gears-frontx/routing-tanstack';
import { CalendarNotFound, CalendarPlaceholder } from './screens/calendar/CalendarPages';

// @cpt-dod:cpt-template-calendar-demo-dod-calendar-placeholder-content:p1
// @cpt-begin:cpt-template-calendar-demo-flow-calendar-placeholder-open-screen:p1:inst-route-tree
const rootRoute = createRootRoute({ component: Outlet, notFoundComponent: CalendarNotFound });

/**
 * The calendar screen's routes inside its entry: `/` renders the placeholder; any other path renders the screen's not-found page.
 */
export const calendarRouteTree = rootRoute.addChildren([createRoute({ getParentRoute: () => rootRoute, path: '/', component: CalendarPlaceholder })]);
// @cpt-end:cpt-template-calendar-demo-flow-calendar-placeholder-open-screen:p1:inst-route-tree
