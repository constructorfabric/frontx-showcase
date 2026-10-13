/**
 * Lifecycle base for demo-mfe screens built from `@gears-frontx/ui-kit`.
 *
 * Every screen entry of this package renders kit components and therefore
 * needs the kit's design tokens inside its own shadow root, so each extends
 * this class instead of `ThemeAwareReactLifecycle` directly. The widget
 * packages do not: a widget renders inside the nested widgets screen's shadow
 * tree and inherits the tokens this class anchors on that screen's host.
 */

import { ThemeAwareReactLifecycle } from '@gears-frontx/react';
import kitThemeCss from '@gears-frontx/ui-kit/theme.css?inline';
import { anchorKitThemeOnShadowHost } from './anchorKitThemeOnShadowHost';

// @cpt-dod:cpt-template-mfe-demo-dod-screen-entries-kit-theme-scope:p1
// @cpt-algo:cpt-template-mfe-demo-algo-screen-entries-kit-token-node:p1
// @cpt-flow:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1
// @cpt-begin:cpt-template-mfe-demo-algo-screen-entries-kit-token-node:p1:inst-rewrite-once
/**
 * `@gears-frontx/ui-kit`'s design tokens, scoped to a shadow root.
 *
 * Rewritten once at module load rather than per mount: the source never
 * changes, and every mounted instance appends the same text.
 *
 * The alternative - loading `theme.css` into the host document instead - is
 * rejected on purpose: the host document's token declarations belong to the
 * shell (which imports the kit's CSS at its own entry), and this MFE cannot
 * assume which shell build hosts it. Anchoring the kit's tokens on the
 * shadow host keeps the screens correct in any host.
 */
const kitThemeCssForShadowRoot = anchorKitThemeOnShadowHost(kitThemeCss);
// @cpt-end:cpt-template-mfe-demo-algo-screen-entries-kit-token-node:p1:inst-rewrite-once

/** Marks the style node that carries the kit's tokens in a shadow root. */
const KIT_THEME_STYLE_ATTRIBUTE = 'data-kit-theme';

/**
 * A `ThemeAwareReactLifecycle` whose shadow root carries the kit's tokens.
 */
export abstract class KitThemedLifecycle extends ThemeAwareReactLifecycle {
  // @cpt-begin:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1:inst-kit-tokens
  /**
   * The base class adopts the host document's stylesheets into the shadow root;
   * the kit's tokens are not among them, and this is the hook the base class
   * documents for exactly that gap.
   *
   * These tokens compose with the base resets the same base class injects:
   * `injectBaseResets` paints `:host` with `var(--foreground)` and
   * `var(--background)` (full CSS colours),
   * and the kit declares those same names as complete colours on the same
   * `:host`, so the host paints in the kit's palette for the active theme.
   * A screen that receives the theme paints its own root through its
   * ScreenFrame block, whose `data-theme` scope the kit's rule paints; the
   * nested widgets screen, which receives none, takes the host's paint.
   *
   * The shell keeps a screen's shadow root across mounts and calls this on
   * every mount; the tokens go into one style node.
   */
  protected override initializeStyles(container: Element | ShadowRoot): void {
    // @cpt-begin:cpt-template-mfe-demo-algo-screen-entries-kit-token-node:p1:inst-reuse-node
    const existing = container.querySelector(`style[${KIT_THEME_STYLE_ATTRIBUTE}]`);
    if (existing) {
      existing.textContent = kitThemeCssForShadowRoot;
      return;
    }
    // @cpt-end:cpt-template-mfe-demo-algo-screen-entries-kit-token-node:p1:inst-reuse-node
    // @cpt-begin:cpt-template-mfe-demo-algo-screen-entries-kit-token-node:p1:inst-append-node
    const style = document.createElement('style');
    style.setAttribute(KIT_THEME_STYLE_ATTRIBUTE, '');
    style.textContent = kitThemeCssForShadowRoot;
    container.appendChild(style);
    // @cpt-end:cpt-template-mfe-demo-algo-screen-entries-kit-token-node:p1:inst-append-node
  }
  // @cpt-end:cpt-template-mfe-demo-flow-screen-entries-mount-screen:p1:inst-kit-tokens
}
