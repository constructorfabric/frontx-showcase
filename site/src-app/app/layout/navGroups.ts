/**
 * The navigation groups this site's host defines: instances of the shell's nav group type (`gts.frontx.screensets.layout.nav_group.v1~`). A screen extension joins a group by naming its instance id in `presentation.group`; the header lists the screens of a group under one entry and names it from the layout strings (`nav.groups.<name>`), and `site.config.json` hides a group from the header by its name (`headerHiddenGroups`).
 */
import type { JSONSchema } from '@gears-frontx/react';
import { navGroupSchema } from '@gears-frontx/frontx-template-shell';

/** A nav group instance: its GTS id and the name the host's strings and settings use. */
export interface NavGroupInstance {
  id: string;
  name: string;
}

/** The demo screens: the header lists them under one entry, the shell being the one part of the site that knows which screens are registered. */
export const DEMOS_NAV_GROUP: NavGroupInstance = { id: 'gts.frontx.screensets.layout.nav_group.v1~frontx.site.layout.demos.v1', name: 'demos' };

/** Every group the host defines. */
export const NAV_GROUPS: readonly NavGroupInstance[] = [DEMOS_NAV_GROUP];

/** Each defined group's name by its instance id: what the navigation reads a screen's `presentation.group` through. */
export const NAV_GROUP_NAMES: ReadonlyMap<string, string> = new Map(NAV_GROUPS.map((group) => [group.id, group.name]));

/**
 * Registers the nav group type and the host's instances with the type system, before any screen extension that names a group is registered.
 * @param typeSystem - the host's type system plugin
 */
// @cpt-algo:cpt-site-algo-shell-layout-navigation-read-group:p1
export function registerNavGroups(typeSystem: { registerSchema(schema: JSONSchema): void; register(instance: unknown): void }): void {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-read-group:p1:inst-register-groups
  typeSystem.registerSchema(navGroupSchema);
  for (const group of NAV_GROUPS) typeSystem.register(group);
  // @cpt-end:cpt-site-algo-shell-layout-navigation-read-group:p1:inst-register-groups
}
