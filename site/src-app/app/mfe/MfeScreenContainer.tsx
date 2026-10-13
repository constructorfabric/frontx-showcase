/**
 * MFE Screen Container Component
 *
 * Bootstraps MFE domains and extensions on first mount, then renders the per-domain `<ExtensionDomainSlot>` for the screen domain. `ExtensionDomainSlot` starts and stops the screen domain's own URL observer from its own attach and detach (ADR 0036, D10/D11); this container builds no routing wiring of its own. It reads that domain's status (`useDomainRouteStatus`) for two cases: an address whose screen entries all fail to resolve shows a fallback, and an address with no screen entry at all (the bare `/`) opens the home screen, the one `site.config.json` names as `homeScreen`, through the screen domain's `mount_ext` action with a `replace` history intent, so the framework router writes its address in place of `/`.
 *
 * A screen that fails to load or mount (`screenLoadFailure`, reported by the screen domain's mount handler) and a bootstrap that fails (the manifest aggregate unreachable) show an error state built from the kit's `Empty` and `Button`, announced as an alert, instead of an empty page. An address whose screen entries all fail to resolve shows a not-found state on the kit's `Empty`. Both states stand in for a screen, so each carries the page's level-one heading. Its retry mounts the failed screen again with the failed action's history intent; after a failed bootstrap, which is not safe to repeat in the same page (`bootstrapOnce.ts`), it reloads the page.
 */

import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import {
  useFrontX,
  useMountedExtensions,
  useDomainRouteStatus,
  useTranslation,
  ExtensionDomainSlot,
  screenDomain,
  FRONTX_ACTION_MOUNT_EXT,
  FRONTX_SCREEN_DOMAIN,
} from '@gears-frontx/react';
import { Button, Empty, EmptyActions, EmptyDescription, EmptyHeader } from '@gears-frontx/ui-kit';
import { EmptyTitle, Text } from '@gears-frontx/kit-candidates';
import { layoutKey } from '@/app/layout/i18n';
import { addressNamesDomain, HOME_SCREEN_TOKEN } from '@/app/layout/home';
import { homeScreen } from '@/app/layout/navigation';
import { useScreenNavigation } from '@/app/layout/useScreenNavigation';
import { bootstrapOnce } from './bootstrapOnce';
import { stampHostTheme } from './hostTheme';
import { screenLoadFailure, useScreenLoadFailure } from './screenLoadFailure';
import styles from './MfeScreenContainer.module.css';

/** The level-one heading a state takes when it stands in for a screen (an element, not JSX, so the heading rule reads its content from the kit part that renders it). */
const pageHeading = createElement('h1');

// @cpt-flow:cpt-site-flow-shell-layout-navigation-retry-failed-screen:p1
function LoadFailed({ onRetry }: { onRetry: () => void }) {
  // @cpt-begin:cpt-site-flow-shell-layout-navigation-retry-failed-screen:p1:inst-render-error-state
  const { t } = useTranslation();
  return (
    <Empty role="alert">
      <EmptyHeader>
        <EmptyTitle render={pageHeading}>{t(layoutKey('screens.loadFailed.title'))}</EmptyTitle>
        <EmptyDescription>{t(layoutKey('screens.loadFailed.description'))}</EmptyDescription>
      </EmptyHeader>
      <EmptyActions>
        <Button onClick={onRetry}>{t(layoutKey('screens.loadFailed.retry'))}</Button>
      </EmptyActions>
    </Empty>
  );
  // @cpt-end:cpt-site-flow-shell-layout-navigation-retry-failed-screen:p1:inst-render-error-state
}

// @cpt-dod:cpt-site-dod-shell-layout-navigation-home-at-bare-address:p1
// @cpt-dod:cpt-site-dod-shell-layout-navigation-load-failure:p1
// @cpt-flow:cpt-site-flow-shell-layout-navigation-open-home:p1
// @cpt-algo:cpt-site-algo-shell-layout-navigation-page-frame:p1
export function MfeScreenContainer() {
  const app = useFrontX();
  const { t } = useTranslation();
  const [bootstrapped, setBootstrapped] = useState(false);
  const [bootstrapFailed, setBootstrapFailed] = useState(false);
  // @cpt-begin:cpt-site-flow-shell-layout-navigation-retry-failed-screen:p1:inst-read-failure
  const loadFailure = useScreenLoadFailure();
  // @cpt-end:cpt-site-flow-shell-layout-navigation-retry-failed-screen:p1:inst-read-failure
  const mountedScreens = useMountedExtensions(FRONTX_SCREEN_DOMAIN);
  const status = useDomainRouteStatus(bootstrapped ? app.mfeRegistry : undefined, FRONTX_SCREEN_DOMAIN);
  const { entries } = useScreenNavigation();
  const home = entries ? homeScreen(entries, HOME_SCREEN_TOKEN) : undefined;

  // The slot root holds the screens' shadow hosts; each one takes the active theme's appearance (hostTheme.ts) while the slot is attached.
  const releaseHostTheme = useRef<(() => void) | undefined>(undefined);
  const onSlotAttached = useCallback(
    (root: Element) => {
      // @cpt-begin:cpt-site-algo-shell-layout-navigation-host-theme:p1:inst-on-attach
      releaseHostTheme.current?.();
      releaseHostTheme.current = stampHostTheme(root, app.themeRegistry);
      // @cpt-end:cpt-site-algo-shell-layout-navigation-host-theme:p1:inst-on-attach
    },
    [app],
  );
  const onSlotDetached = useCallback(() => {
    // @cpt-begin:cpt-site-algo-shell-layout-navigation-host-theme:p1:inst-on-detach
    releaseHostTheme.current?.();
    releaseHostTheme.current = undefined;
    // @cpt-end:cpt-site-algo-shell-layout-navigation-host-theme:p1:inst-on-detach
  }, []);

  // @cpt-begin:cpt-site-flow-shell-layout-navigation-open-home:p1:inst-bootstrap-once
  useEffect(() => {
    let cancelled = false;
    bootstrapOnce(app)
      .then(() => {
        if (!cancelled) setBootstrapped(true);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('[MFE Bootstrap] Failed to bootstrap MFE:', error);
        setBootstrapFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [app]);
  // @cpt-end:cpt-site-flow-shell-layout-navigation-open-home:p1:inst-bootstrap-once

  // The bare shell address names no screen; the shell has no default-screen setting, so the layout opens the configured home screen.
  // @cpt-begin:cpt-site-flow-shell-layout-navigation-open-home:p1:inst-detect-bare
  const atBareAddress = bootstrapped && status.entries === 0 && mountedScreens.length === 0;
  // @cpt-end:cpt-site-flow-shell-layout-navigation-open-home:p1:inst-detect-bare
  const homeId = home?.id;
  const navigationKnown = entries !== undefined;
  useEffect(() => {
    // @cpt-begin:cpt-site-flow-shell-layout-navigation-open-home:p1:inst-if-not-bare
    if (!atBareAddress || !navigationKnown) return;
    // @cpt-end:cpt-site-flow-shell-layout-navigation-open-home:p1:inst-if-not-bare
    // The shell app's own navigation facade reads the composed address (the shell owns no entry of its own, so the facade reads and never writes).
    // @cpt-begin:cpt-site-flow-shell-layout-navigation-open-home:p1:inst-if-address-names-screen
    const location = app.mfeRouter?.navigation().location();
    if (location && screenDomain.route !== undefined && addressNamesDomain(location, screenDomain.route)) return;
    // @cpt-end:cpt-site-flow-shell-layout-navigation-open-home:p1:inst-if-address-names-screen
    // @cpt-begin:cpt-site-flow-shell-layout-navigation-open-home:p1:inst-if-home-missing
    if (homeId === undefined) {
      // A configured home that no registered screen carries is a configuration error; opening some other screen would hide it.
      console.error(`[MFE Screens] site.config.json homeScreen "${HOME_SCREEN_TOKEN}" names no registered screen`);
      return;
    }
    // @cpt-end:cpt-site-flow-shell-layout-navigation-open-home:p1:inst-if-home-missing
    // @cpt-begin:cpt-site-flow-shell-layout-navigation-open-home:p1:inst-mount-home
    app.mfeRegistry?.executeActionsChain({ action: { type: FRONTX_ACTION_MOUNT_EXT, target: FRONTX_SCREEN_DOMAIN, payload: { subject: homeId, history: 'replace' } } });
    // @cpt-end:cpt-site-flow-shell-layout-navigation-open-home:p1:inst-mount-home
  }, [app, atBareAddress, navigationKnown, homeId]);

  // Every URL entry for this domain failed to resolve to a mounted screen: an unknown token in the address bar, not a moment mid-mount.
  const unresolvedOnly = status.entries > 0 && status.unresolved === status.entries && mountedScreens.length === 0;

  // The retry replays the failed action's history intent: a failed header click left the previous page's address in place (the router writes nothing for a failed mount), so a push keeps that entry. A URL-driven mount (`none`) retries with push, which writes nothing because the address already names the screen.
  const retryScreen = () => {
    // @cpt-begin:cpt-site-flow-shell-layout-navigation-retry-failed-screen:p1:inst-retry-intent
    const subject = loadFailure?.extensionId;
    const history = loadFailure?.history === 'replace' ? 'replace' : 'push';
    // @cpt-end:cpt-site-flow-shell-layout-navigation-retry-failed-screen:p1:inst-retry-intent
    // @cpt-begin:cpt-site-flow-shell-layout-navigation-retry-failed-screen:p1:inst-retry-clear
    screenLoadFailure.clear();
    // @cpt-end:cpt-site-flow-shell-layout-navigation-retry-failed-screen:p1:inst-retry-clear
    // @cpt-begin:cpt-site-flow-shell-layout-navigation-retry-failed-screen:p1:inst-if-no-subject
    if (subject === undefined) return;
    // @cpt-end:cpt-site-flow-shell-layout-navigation-retry-failed-screen:p1:inst-if-no-subject
    // @cpt-begin:cpt-site-flow-shell-layout-navigation-retry-failed-screen:p1:inst-retry-mount
    Promise.resolve(app.mfeRegistry?.executeActionsChain({ action: { type: FRONTX_ACTION_MOUNT_EXT, target: FRONTX_SCREEN_DOMAIN, payload: { subject, history } } })).catch((error: unknown) => {
      console.error(`[MFE Screens] retrying ${subject} failed:`, error);
    });
    // @cpt-end:cpt-site-flow-shell-layout-navigation-retry-failed-screen:p1:inst-retry-mount
  };

  return (
    <div className={styles.container} data-mfe-screen-container>
      {/* @cpt-begin:cpt-site-flow-shell-layout-navigation-retry-failed-screen:p1:inst-if-bootstrap-failed */}
      {bootstrapFailed ? <LoadFailed onRetry={() => window.location.reload()} /> : null}
      {/* @cpt-end:cpt-site-flow-shell-layout-navigation-retry-failed-screen:p1:inst-if-bootstrap-failed */}
      {/* @cpt-begin:cpt-site-flow-shell-layout-navigation-retry-failed-screen:p1:inst-if-load-failed */}
      {loadFailure ? <LoadFailed onRetry={retryScreen} /> : null}
      {/* @cpt-end:cpt-site-flow-shell-layout-navigation-retry-failed-screen:p1:inst-if-load-failed */}
      {bootstrapped && app.mfeRegistry ? <ExtensionDomainSlot registry={app.mfeRegistry} domainId={screenDomain.id} className={styles.slot} onAttached={onSlotAttached} onDetached={onSlotDetached} /> : null}
      {/* @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-not-found */}
      {unresolvedOnly ? (
        <Empty data-testid="screen-route-fallback" role="status">
          <EmptyHeader>
            <EmptyTitle render={pageHeading}>{t(layoutKey('screens.unresolved'))}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : null}
      {/* @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-not-found */}
      {/* After a failed bootstrap the navigation lists nothing because nothing loaded, not because no screen exists: the alert above is the only message. */}
      {/* @cpt-begin:cpt-site-flow-shell-layout-navigation-retry-failed-screen:p1:inst-empty-navigation */}
      {!bootstrapFailed && entries?.length === 0 ? (
        <Text role="status" tone="muted" className={styles.fallback}>
          {t(layoutKey('screens.empty'))}
        </Text>
      ) : null}
      {/* @cpt-end:cpt-site-flow-shell-layout-navigation-retry-failed-screen:p1:inst-empty-navigation */}
    </div>
  );
}
