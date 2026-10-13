/**
 * Bridge between the host's theme identifier and the token scope
 * `@gears-frontx/ui-kit` selects on.
 *
 * Every screen package of this template needs the same mapping, so one copy
 * lives in the template's shared folder, reached through the `@site-shared`
 * alias, rather than beside any one of them.
 */

// @cpt-algo:cpt-template-site-algo-screen-frame-theme-scope:p1
// @cpt-dod:cpt-template-site-dod-screen-frame-shadow-tokens:p1
/**
 * Host theme identifiers whose palette is dark.
 *
 * Written down rather than derived, because there is nothing to derive it
 * from: `ThemeConfig` (@gears-frontx/framework) carries `id`, `name`,
 * `variables` and `default` and no light/dark flag, and the bridge hands a
 * screen the identifier alone - not the theme definition, and not the registry
 * that holds it. The set therefore has to gain an entry whenever the host
 * registers another dark theme, or that theme's screens paint dark host chrome
 * around a light kit surface.
 */
// @cpt-begin:cpt-template-site-algo-screen-frame-theme-scope:p1:inst-dark-themes
const DARK_HOST_THEMES: ReadonlySet<string> = new Set(['dark', 'dracula', 'dracula-large']);
// @cpt-end:cpt-template-site-algo-screen-frame-theme-scope:p1:inst-dark-themes

/**
 * Map a host theme identifier onto the token scope `@gears-frontx/ui-kit`
 * understands.
 *
 * The kit scopes its tokens with `data-theme="light" | "dark"`, so a host
 * palette is matched to whichever of the two it is closer to - see
 * {@link DARK_HOST_THEMES} for why the dark side is an enumeration.
 *
 * An unrecognised identifier resolves to the light scope rather than to no
 * scope at all: an element carrying neither value inherits whatever the kit's
 * `prefers-color-scheme` fallback resolved on the shadow host, which is how a
 * screen ends up dark inside a light shell on a developer machine set to dark
 * mode.
 *
 * Two scopes is the whole resolution this bridge can offer. A host theme is a
 * full palette, not a light/dark bit - `dracula` maps to the kit's dark scope
 * and then renders in the kit's greys rather than Dracula's purples. Closing
 * that gap means unifying the two token grammars, a decision above this
 * template.
 *
 * @param hostTheme - Value of the host's shared theme property
 */
export function kitThemeScopeFor(hostTheme: string): 'light' | 'dark' {
  // @cpt-begin:cpt-template-site-algo-screen-frame-theme-scope:p1:inst-return-scope
  return DARK_HOST_THEMES.has(hostTheme) ? 'dark' : 'light';
  // @cpt-end:cpt-template-site-algo-screen-frame-theme-scope:p1:inst-return-scope
}
