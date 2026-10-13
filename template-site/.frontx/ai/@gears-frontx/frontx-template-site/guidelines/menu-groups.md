# Menu groups

How a screen joins a group in the site's header menu, such as the Demos group under which the header lists the demo screens.

## The nav group type and the host's groups

- template-shell's screen extension type (`gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~`, `site/src/gts/schemas/extension_screen.v1.json`) has an optional `presentation.group`: the id of an instance of the nav group type (`x-gts-ref: gts.frontx.screensets.layout.nav_group.v1~*`). Its `pattern` makes the type system refuse, at registration, a value that is not a nav group id, such as the bare token `demos`. The `x-gts-ref` is declarative: the type system does not check that the named instance exists, so a well-formed id the host does not define is admitted, and the menu lists that screen top-level.
- The nav group type is `gts.frontx.screensets.layout.nav_group.v1~` (`site/src/gts/schemas/nav_group.v1.json`, exported as `navGroupSchema` from `@gears-frontx/frontx-template-shell`): an object `{ id, name }`, `name` matching `^[a-z][a-z0-9-]*$`, the key the host's strings and settings use.
- The host defines the instances in `site/src-app/app/layout/navGroups.ts`: one, `gts.frontx.screensets.layout.nav_group.v1~frontx.site.layout.demos.v1`, named `demos`. `main.tsx` registers the type and the instances with the type system through `registerNavGroups(gtsPlugin)`, after the screen extension schema.
- The header's menu reads a screen's group by looking its `presentation.group` id up in the host's groups; a screen without a group, or naming a group the host does not define, is a top-level entry. Screens sharing a group become one entry placed at the order of its first member; the entry is named by the layout string `layout:nav.groups.<name>`. `site.config.json` `headerHiddenGroups` lists, by name, the groups the header leaves out; their screens stay registered and addressable.

## Declaring a screen in a group

- The screen is a plain screen extension: its id is chained directly onto the shell's screen type, `gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~<vendor>.<package>.screens.<screen>.v1`, and its package's `mfe.json` carries no screen type schema.
- `presentation.group` is the full id of a group the host defines, such as `gts.frontx.screensets.layout.nav_group.v1~frontx.site.layout.demos.v1` for the Demos group. A new group is a new instance in `navGroups.ts` and its string `nav.groups.<name>` in the layout strings.
- `site/src-app/app/layout/navGroups.test.ts` checks that the host's groups are nav group instances, each named once, that every group `headerHiddenGroups` hides is defined, that the screen type accepts a screen without a group and one naming a nav group id and refuses a group that is not a nav group id, and that every assembled package names only host-defined groups and registers through the type system; the package's own manifest test asserts its screens name the group's id.
