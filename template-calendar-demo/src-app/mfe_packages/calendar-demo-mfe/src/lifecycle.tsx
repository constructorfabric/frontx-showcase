import type React from 'react';
import type { ChildMfeBridge } from '@gears-frontx/react';
import { ExtensionRouter, ThemeAwareReactLifecycle } from '@gears-frontx/react';
import kitThemeCss from '@gears-frontx/ui-kit/theme.css?inline';
import { mfeApp } from './init';
import { calendarRouteTree } from './routes';
import { anchorKitThemeOnShadowHost } from './shared/anchorKitThemeOnShadowHost';
import { ScreenFrame } from './shared/ScreenFrame';

// @cpt-dod:cpt-template-calendar-demo-dod-calendar-placeholder-screen-frame:p1
// @cpt-flow:cpt-template-calendar-demo-flow-calendar-placeholder-open-screen:p1
// @cpt-algo:cpt-template-calendar-demo-algo-calendar-placeholder-kit-token-node:p1
// @cpt-begin:cpt-template-calendar-demo-algo-calendar-placeholder-kit-token-node:p1:inst-rewrite-once
/** The kit's design tokens rewritten for a shadow root, once at module load. */
const kitThemeCssForShadowRoot = anchorKitThemeOnShadowHost(kitThemeCss);
// @cpt-end:cpt-template-calendar-demo-algo-calendar-placeholder-kit-token-node:p1:inst-rewrite-once

/** Marks the style node that carries the kit's tokens in a shadow root. */
const KIT_THEME_STYLE_ATTRIBUTE = 'data-kit-theme';

// @cpt-begin:cpt-template-calendar-demo-flow-calendar-placeholder-open-screen:p1:inst-bind-app
/**
 * The calendar screen's lifecycle: the ui-kit tokens in the shadow root, and the screen's own route tree rendered by the framework's `<ExtensionRouter>` over this package's registry.
 */
export class CalendarDemoLifecycle extends ThemeAwareReactLifecycle {
  constructor() {
    super(mfeApp);
  }
  // @cpt-end:cpt-template-calendar-demo-flow-calendar-placeholder-open-screen:p1:inst-bind-app

  // @cpt-begin:cpt-template-calendar-demo-flow-calendar-placeholder-open-screen:p1:inst-kit-token-node
  /** The shell keeps a screen's shadow root across mounts and calls this on every mount; the tokens go into one style node. */
  protected override initializeStyles(container: Element | ShadowRoot): void {
    // @cpt-begin:cpt-template-calendar-demo-algo-calendar-placeholder-kit-token-node:p1:inst-reuse-node
    const existing = container.querySelector(`style[${KIT_THEME_STYLE_ATTRIBUTE}]`);
    if (existing) {
      existing.textContent = kitThemeCssForShadowRoot;
      return;
    }
    // @cpt-end:cpt-template-calendar-demo-algo-calendar-placeholder-kit-token-node:p1:inst-reuse-node
    // @cpt-begin:cpt-template-calendar-demo-algo-calendar-placeholder-kit-token-node:p1:inst-append-node
    const style = document.createElement('style');
    style.setAttribute(KIT_THEME_STYLE_ATTRIBUTE, '');
    style.textContent = kitThemeCssForShadowRoot;
    container.appendChild(style);
    // @cpt-end:cpt-template-calendar-demo-algo-calendar-placeholder-kit-token-node:p1:inst-append-node
  }
  // @cpt-end:cpt-template-calendar-demo-flow-calendar-placeholder-open-screen:p1:inst-kit-token-node

  // @cpt-begin:cpt-template-calendar-demo-flow-calendar-placeholder-open-screen:p1:inst-render-frame
  protected renderContent(bridge: ChildMfeBridge): React.ReactNode {
    const registry = mfeApp.mfeRegistry;
    if (!registry) throw new Error('calendar-demo-mfe: the app was built without microfrontends()');
    return (
      <ScreenFrame bridge={bridge}>
        <ExtensionRouter registry={registry} routeTree={calendarRouteTree} />
      </ScreenFrame>
    );
  }
  // @cpt-end:cpt-template-calendar-demo-flow-calendar-placeholder-open-screen:p1:inst-render-frame
}

// @cpt-begin:cpt-template-calendar-demo-flow-calendar-placeholder-open-screen:p1:inst-export-entry
/** Module Federation expects a default export with `mount` and `unmount`. */
export default new CalendarDemoLifecycle();
// @cpt-end:cpt-template-calendar-demo-flow-calendar-placeholder-open-screen:p1:inst-export-entry
