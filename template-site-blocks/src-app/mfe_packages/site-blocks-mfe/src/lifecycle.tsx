import type React from 'react';
import type { ChildMfeBridge } from '@gears-frontx/react';
import { ExtensionRouter, ThemeAwareReactLifecycle } from '@gears-frontx/react';
import kitThemeCss from '@gears-frontx/ui-kit/theme.css?inline';
import { mfeApp } from './init';
import { blocksRouteTree } from './routes';
import { anchorKitThemeOnShadowHost } from './shared/anchorKitThemeOnShadowHost';
import { ScreenFrame } from './shared/ScreenFrame';

/** The kit's design tokens rewritten for a shadow root, once at module load. */
const kitThemeCssForShadowRoot = anchorKitThemeOnShadowHost(kitThemeCss);

/** Marks the style node that carries the kit's tokens in a shadow root. */
const KIT_THEME_STYLE_ATTRIBUTE = 'data-kit-theme';

// @cpt-dod:cpt-template-site-blocks-dod-blocks-showcase-screen:p1
// @cpt-flow:cpt-template-site-blocks-flow-blocks-showcase-open:p1
/**
 * The blocks showcase screen's lifecycle: the ui-kit tokens in the shadow root (the brand and the layout tokens arrive with the document's sheets), and the screen's own route tree rendered by the framework's `<ExtensionRouter>` over this package's registry.
 */
export class SiteBlocksLifecycle extends ThemeAwareReactLifecycle {
  constructor() {
    super(mfeApp);
  }

  /** The shell keeps a screen's shadow root across mounts and calls this on every mount; the tokens go into one style node. */
  protected override initializeStyles(container: Element | ShadowRoot): void {
    // @cpt-begin:cpt-template-site-blocks-flow-blocks-showcase-open:p1:inst-kit-tokens
    const existing = container.querySelector(`style[${KIT_THEME_STYLE_ATTRIBUTE}]`);
    if (existing) {
      existing.textContent = kitThemeCssForShadowRoot;
      return;
    }
    const style = document.createElement('style');
    style.setAttribute(KIT_THEME_STYLE_ATTRIBUTE, '');
    style.textContent = kitThemeCssForShadowRoot;
    container.appendChild(style);
    // @cpt-end:cpt-template-site-blocks-flow-blocks-showcase-open:p1:inst-kit-tokens
  }

  protected renderContent(bridge: ChildMfeBridge): React.ReactNode {
    // @cpt-begin:cpt-template-site-blocks-flow-blocks-showcase-open:p1:inst-render-router
    const registry = mfeApp.mfeRegistry;
    if (!registry) throw new Error('site-blocks-mfe: the app was built without microfrontends()');
    return (
      <ScreenFrame bridge={bridge}>
        <ExtensionRouter registry={registry} routeTree={blocksRouteTree} />
      </ScreenFrame>
    );
    // @cpt-end:cpt-template-site-blocks-flow-blocks-showcase-open:p1:inst-render-router
  }
}

/** Module Federation expects a default export with `mount` and `unmount`. */
export default new SiteBlocksLifecycle();
