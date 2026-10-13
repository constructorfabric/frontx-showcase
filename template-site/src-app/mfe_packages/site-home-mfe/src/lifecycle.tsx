// @cpt-dod:cpt-template-site-dod-screen-frame-lifecycle:p1
import type React from 'react';
import type { ChildMfeBridge } from '@gears-frontx/react';
import { ExtensionRouter, ThemeAwareReactLifecycle } from '@gears-frontx/react';
import kitThemeCss from '@gears-frontx/ui-kit/theme.css?inline';
import { anchorKitThemeOnShadowHost } from '@site-shared/theme/anchorKitThemeOnShadowHost';
import { mfeApp } from './init';
import { homeRouteTree } from './routes';
import { ScreenFrame, shippedLanguages } from './shared/ScreenFrame';

// @cpt-flow:cpt-template-site-flow-screen-frame-mount-screen:p1
// @cpt-dod:cpt-template-site-dod-screen-frame-shadow-tokens:p1
/** The kit's design tokens rewritten for a shadow root, once at module load. The brand is not appended here: it reaches the shadow root from the document with the host's adopted head styles. */
// @cpt-begin:cpt-template-site-flow-screen-frame-mount-screen:p1:inst-prepare-module
const kitThemeCssForShadowRoot = anchorKitThemeOnShadowHost(kitThemeCss);
// @cpt-end:cpt-template-site-flow-screen-frame-mount-screen:p1:inst-prepare-module

/** The languages the screen ships strings for; the shell may offer more. */
// @cpt-begin:cpt-template-site-flow-screen-frame-mount-screen:p1:inst-prepare-module
const LANGUAGES = shippedLanguages(Object.keys(import.meta.glob('./screens/*/i18n/*.json')));
// @cpt-end:cpt-template-site-flow-screen-frame-mount-screen:p1:inst-prepare-module

/** Marks the style node that carries the kit's tokens in a shadow root. */
const KIT_THEME_STYLE_ATTRIBUTE = 'data-kit-theme';

/**
 * The home screen's lifecycle: the kit's tokens on the shadow host, and the screen's own route tree rendered by the framework's `<ExtensionRouter>` over this package's registry.
 */
export class HomeLifecycle extends ThemeAwareReactLifecycle {
  constructor() {
    super(mfeApp);
  }

  /** The shell keeps a screen's shadow root across mounts and calls this on every mount; the tokens go into one style node. */
  protected override initializeStyles(container: Element | ShadowRoot): void {
    // @cpt-begin:cpt-template-site-flow-screen-frame-mount-screen:p1:inst-reuse-style-node
    const existing = container.querySelector(`style[${KIT_THEME_STYLE_ATTRIBUTE}]`);
    if (existing) {
      existing.textContent = kitThemeCssForShadowRoot;
      return;
    }
    // @cpt-end:cpt-template-site-flow-screen-frame-mount-screen:p1:inst-reuse-style-node
    // @cpt-begin:cpt-template-site-flow-screen-frame-mount-screen:p1:inst-create-style-node
    const style = document.createElement('style');
    style.setAttribute(KIT_THEME_STYLE_ATTRIBUTE, '');
    style.textContent = kitThemeCssForShadowRoot;
    container.appendChild(style);
    // @cpt-end:cpt-template-site-flow-screen-frame-mount-screen:p1:inst-create-style-node
  }

  protected renderContent(bridge: ChildMfeBridge): React.ReactNode {
    // @cpt-begin:cpt-template-site-flow-screen-frame-mount-screen:p1:inst-require-registry
    const registry = mfeApp.mfeRegistry;
    if (!registry) throw new Error('site-home-mfe: the app was built without microfrontends()');
    // @cpt-end:cpt-template-site-flow-screen-frame-mount-screen:p1:inst-require-registry
    // @cpt-begin:cpt-template-site-flow-screen-frame-mount-screen:p1:inst-render-router
    return (
      <ScreenFrame bridge={bridge} languages={LANGUAGES}>
        <ExtensionRouter registry={registry} routeTree={homeRouteTree} />
      </ScreenFrame>
    );
    // @cpt-end:cpt-template-site-flow-screen-frame-mount-screen:p1:inst-render-router
  }
}

/** Module Federation expects a default export with `mount` and `unmount`. */
export default new HomeLifecycle();
