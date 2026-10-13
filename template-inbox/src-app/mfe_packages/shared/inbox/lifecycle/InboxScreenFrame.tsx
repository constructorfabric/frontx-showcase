import { useEffect, useMemo, useRef } from 'react';
import type { AnyRoute } from '@gears-frontx/routing-tanstack';
import {
  ExtensionRouter,
  FRONTX_SHARED_PROPERTY_LANGUAGE,
  FRONTX_SHARED_PROPERTY_THEME,
  type ChildMfeBridge,
  type MfeRegistry,
} from '@gears-frontx/react';
import { useInboxTranslate, type InboxCatalogues } from '../i18n/useInboxTranslate';
import { requestScreenHeadingFocus } from '../ui/ScreenHeading';
import { layoutForWidth, ScreenLayoutContext, useContainerMeasure } from '../ui/screenLayout';
import { kitThemeScopeFor } from './kitThemeScope';
import { ScreenErrorBoundary } from './ScreenErrorBoundary';
import { InboxScreenContext, type InboxScreenContextValue } from './screenContext';
import { useBridgeProperty } from './useBridgeProperty';
import { directionFor, useHostDirection } from './useHostDirection';
import styles from './frame.module.css';

/** A package's route tree, as `createRootRoute(...).addChildren([...])` builds it. */
export type InboxRouteTree = AnyRoute;

export type InboxScreenFrameProps = {
  bridge: ChildMfeBridge;
  /** The package's own catalogues, merged over the shared ones. */
  catalogues: InboxCatalogues;
  /** The package's route tree, matched inside the entry the shell addressed for this screen. */
  routeTree: InboxRouteTree;
  /** The registry of the package's own app (built with `microfrontends()`), which `<ExtensionRouter>` builds the screen's router from. */
  registry: MfeRegistry;
};

/**
 * Everything an inbox screen needs around it inside its shadow root.
 *
 * - The kit's token scope: `data-theme` from the shell's theme property, so
 *   kit tokens resolve in the light or dark palette instead of inheriting
 *   whatever the shadow host carries.
 * - Direction: `dir` on the frame and on the shadow host, from the language.
 * - The pane layout: the root is the `inbox-screen` size container the
 *   stylesheets query, and its measured width picks the layout the screens
 *   read (`useScreenLayout`), so the panes follow the room the shell leaves
 *   beside its sidebar rather than the viewport. The routes render only once
 *   that width has been read, in the layout effect before the first paint:
 *   a screen never mounts in a layout its width does not have, so no pane of
 *   another layout runs its effects or its requests and unmounts again.
 * - The portal node, rendered first, and the translator, both through
 *   `InboxScreenContext`.
 * - The screen's router: the framework's `<ExtensionRouter>` over the
 *   package's registry, which resolves the screen's address inside the page
 *   URL (`route=` inside the screen's own entry).
 * - Error boundaries, so a crashing screen leaves the shell working: one
 *   around the router, and one inside it around the pages, reset by the
 *   screen's own router location (`ScreenRouteBoundary`).
 * - On mount, focus on the screen heading. The document title and
 *   head belong to the site's head-sync, which applies the screen's `seo`
 *   metadata; the frame never writes them.
 */
// @cpt-dod:cpt-template-inbox-dod-screen-frame-frame:p1
// @cpt-flow:cpt-template-inbox-flow-screen-frame-mount:p1
export function InboxScreenFrame({ bridge, catalogues, routeTree, registry }: InboxScreenFrameProps) {
  // @cpt-begin:cpt-template-inbox-flow-screen-frame-mount:p1:inst-read-host-properties
  const theme = useBridgeProperty<unknown>(bridge, FRONTX_SHARED_PROPERTY_THEME, 'light');
  const language = useBridgeProperty<unknown>(bridge, FRONTX_SHARED_PROPERTY_LANGUAGE, 'en');
  // @cpt-end:cpt-template-inbox-flow-screen-frame-mount:p1:inst-read-host-properties
  // @cpt-begin:cpt-template-inbox-flow-screen-frame-mount:p1:inst-build-translator
  const t = useInboxTranslate(bridge, catalogues);
  // @cpt-end:cpt-template-inbox-flow-screen-frame-mount:p1:inst-build-translator
  const frameRef = useRef<HTMLDivElement>(null);
  const portalContainer = useRef<HTMLDivElement>(null);
  // @cpt-begin:cpt-template-inbox-flow-screen-frame-mount:p1:inst-sync-direction
  const languageCode = typeof language === 'string' ? language : 'en';
  useHostDirection(frameRef, languageCode);
  // @cpt-end:cpt-template-inbox-flow-screen-frame-mount:p1:inst-sync-direction
  // @cpt-begin:cpt-template-inbox-flow-screen-frame-mount:p1:inst-measure-layout
  const { value: layout, measured } = useContainerMeasure(frameRef, layoutForWidth);
  // @cpt-end:cpt-template-inbox-flow-screen-frame-mount:p1:inst-measure-layout

  // A screen mounts when the host opens it, on a page load or after a
  // navigation, and the page it opens on is announced by moving focus to its
  // heading. The decision needs nothing outside the screen's own container.
  // @cpt-begin:cpt-template-inbox-flow-screen-frame-mount:p1:inst-decide-focus
  useEffect(() => {
    requestScreenHeadingFocus();
  }, []);
  // @cpt-end:cpt-template-inbox-flow-screen-frame-mount:p1:inst-decide-focus

  // @cpt-begin:cpt-template-inbox-flow-screen-frame-mount:p1:inst-provide-context
  const context = useMemo<InboxScreenContextValue>(() => ({ bridge, t, portalContainer }), [bridge, t]);
  // @cpt-end:cpt-template-inbox-flow-screen-frame-mount:p1:inst-provide-context

  // @cpt-begin:cpt-template-inbox-flow-screen-frame-mount:p1:inst-return-frame
  return (
    <div
      ref={frameRef}
      className={styles.frame}
      data-theme={kitThemeScopeFor(typeof theme === 'string' ? theme : 'light')}
      dir={directionFor(languageCode)}
    >
      <div ref={portalContainer} className={styles.portal} data-inbox-portal="" />
      <InboxScreenContext.Provider value={context}>
        <ScreenLayoutContext.Provider value={layout}>
          {/* Around the router itself; a page's failure is caught inside the router, where the screen's own location resets it (`ScreenRouteBoundary`). */}
          <ScreenErrorBoundary t={t}>
            {measured ? <ExtensionRouter registry={registry} routeTree={routeTree} /> : null}
          </ScreenErrorBoundary>
        </ScreenLayoutContext.Provider>
      </InboxScreenContext.Provider>
    </div>
  );
  // @cpt-end:cpt-template-inbox-flow-screen-frame-mount:p1:inst-return-frame
}
