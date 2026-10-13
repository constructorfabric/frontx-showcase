import type { ReactNode } from 'react';
import type { ChildMfeBridge, MfeMountContext } from '@gears-frontx/react';
import { ExtensionRouter, ThemeAwareReactLifecycle } from '@gears-frontx/react';
import kitThemeCss from '@gears-frontx/ui-kit/theme.css?inline';
import { mfeApp } from './init';
import { anchorKitThemeOnShadowHost } from './frame/anchorKitThemeOnShadowHost';
import { SHOW_COMPONENT_ACTION, ShowComponentHandler } from './frame/showComponent';
import { ScreenFrame } from './frame/ScreenFrame';
import { catalogueRouteTree } from './routes';
import { CatalogueTextProvider } from './screens/catalogue/CatalogueText';

/** The kit's design tokens rewritten for a shadow root, once at module load. */
// @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-mount:p1:inst-anchor-tokens
const kitThemeCssForShadowRoot = anchorKitThemeOnShadowHost(kitThemeCss);
// @cpt-end:cpt-template-catalogue-flow-catalogue-screen-mount:p1:inst-anchor-tokens

/** Marks the style node that carries the kit's tokens in a shadow root. */
const KIT_THEME_STYLE_ATTRIBUTE = 'data-kit-theme';

/**
 * The catalogue screen's lifecycle: the kit's tokens on the shadow host, and the screen's route tree rendered by the framework's `<ExtensionRouter>` over this package's registry.
 *
 * The module exports its lifecycle as the default export and nothing else. The lazily loaded example pages share code with this module's chunk, so Rollup consolidates the chunk and rewrites its default export; frontxMfGts() repairs that only when the module's namespace holds `default` alone.
 */
// @cpt-flow:cpt-template-catalogue-flow-catalogue-screen-mount:p1
// @cpt-dod:cpt-template-catalogue-dod-catalogue-screen-manifest-lifecycle:p1
class CatalogueLifecycle extends ThemeAwareReactLifecycle {
  constructor() {
    super(mfeApp);
  }

  /** The shell keeps a screen's shadow root across mounts and calls this on every mount; the tokens go into one style node. */
  protected override initializeStyles(container: Element | ShadowRoot): void {
    // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-mount:p1:inst-replace-token-style
    const existing = container.querySelector(`style[${KIT_THEME_STYLE_ATTRIBUTE}]`);
    if (existing) {
      existing.textContent = kitThemeCssForShadowRoot;
      return;
    }
    // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-mount:p1:inst-replace-token-style
    // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-mount:p1:inst-append-token-style
    const style = document.createElement('style');
    style.setAttribute(KIT_THEME_STYLE_ATTRIBUTE, '');
    style.textContent = kitThemeCssForShadowRoot;
    container.appendChild(style);
    // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-mount:p1:inst-append-token-style
  }

  /** Renders the screen, then registers its `show_component` handler before `mount()` returns, so a chain's `next` step that shows a component's page finds it. */
  override mount(container: Element | ShadowRoot, bridge: ChildMfeBridge, mountContext?: MfeMountContext): void {
    super.mount(container, bridge, mountContext);
    // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-mount:p1:inst-register-handler
    bridge.registerActionHandler(SHOW_COMPONENT_ACTION, new ShowComponentHandler(mfeApp));
    // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-mount:p1:inst-register-handler
  }

  protected renderContent(bridge: ChildMfeBridge): ReactNode {
    // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-mount:p1:inst-render-router
    const registry = mfeApp.mfeRegistry;
    if (!registry) throw new Error('catalogue-mfe: the app was built without microfrontends()');
    return (
      <ScreenFrame bridge={bridge}>
        <CatalogueTextProvider>
          <ExtensionRouter registry={registry} routeTree={catalogueRouteTree} />
        </CatalogueTextProvider>
      </ScreenFrame>
    );
    // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-mount:p1:inst-render-router
  }
}

/** Module Federation expects a default export with `mount` and `unmount`. */
// @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-mount:p1:inst-export-lifecycle
export default new CatalogueLifecycle();
// @cpt-end:cpt-template-catalogue-flow-catalogue-screen-mount:p1:inst-export-lifecycle
