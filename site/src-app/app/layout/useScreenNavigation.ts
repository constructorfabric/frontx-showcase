import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useFrontX,
  useDomainExtensions,
  useMountedExtensions,
  FRONTX_ACTION_MOUNT_EXT,
  FRONTX_SCREEN_DOMAIN,
  screenDomain,
  type Extension,
  type ScreenExtension,
} from '@gears-frontx/react';
import { bootstrapOnce } from '@/app/mfe/bootstrapOnce';
import { NAV_GROUP_NAMES } from './navGroups';
import { buildNavigation, type NavEntry } from './navigation';

export interface ScreenNavigation {
  /** `undefined` until bootstrap settles: an empty list before that means "not known yet", not "no screens". */
  entries: NavEntry[] | undefined;
  /** Mounts a screen through the screen domain's `mount_ext` action; the framework router writes its address. */
  open: (extensionId: string) => void;
}

/**
 * Registration validated the extension against the screen schema, which requires a route and a presentation block; the registry still types what it returns as the base `Extension`, so this narrows it by what the schema guarantees instead of asserting it.
 */
// @cpt-algo:cpt-site-algo-shell-layout-navigation-read-screens:p1
function isScreenExtension(extension: Extension): extension is ScreenExtension {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-read-screens:p1:inst-keep-screens
  return typeof extension.route === 'string' && 'presentation' in extension && typeof extension.presentation === 'object' && extension.presentation !== null;
  // @cpt-end:cpt-site-algo-shell-layout-navigation-read-screens:p1:inst-keep-screens
}

/**
 * The registered screen extensions as navigation entries, and the action that opens one. The list follows the registry: `useDomainExtensions` re-reads it whenever the store records a registration change, so a screen registered after bootstrap appears in the menu and an unregistered one leaves it.
 */
// @cpt-flow:cpt-site-flow-shell-layout-navigation-open-screen:p1
export function useScreenNavigation(): ScreenNavigation {
  const app = useFrontX();
  const { mfeRegistry } = app;
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-read-screens:p1:inst-read-registry
  const mountedId = useMountedExtensions(FRONTX_SCREEN_DOMAIN)[0]?.id;
  const registered = useDomainExtensions(FRONTX_SCREEN_DOMAIN);
  // @cpt-end:cpt-site-algo-shell-layout-navigation-read-screens:p1:inst-read-registry
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-read-screens:p1:inst-track-bootstrap
  const [bootstrap, setBootstrap] = useState<'pending' | 'settled' | 'failed'>('pending');

  useEffect(() => {
    let cancelled = false;
    bootstrapOnce(app).then(
      () => {
        if (!cancelled) setBootstrap('settled');
      },
      // MfeScreenContainer logs the bootstrap failure; the navigation only shows that there is nothing to list.
      () => {
        if (!cancelled) setBootstrap('failed');
      }
    );
    return () => {
      cancelled = true;
    };
  }, [app]);
  // @cpt-end:cpt-site-algo-shell-layout-navigation-read-screens:p1:inst-track-bootstrap

  const domainKey = screenDomain.route;
  const entries = useMemo(() => {
    // @cpt-begin:cpt-site-algo-shell-layout-navigation-read-screens:p1:inst-if-not-ready
    if (domainKey === undefined) return [];
    if (bootstrap === 'pending') return undefined;
    if (bootstrap === 'failed' || !mfeRegistry) return [];
    // @cpt-end:cpt-site-algo-shell-layout-navigation-read-screens:p1:inst-if-not-ready
    // @cpt-begin:cpt-site-algo-shell-layout-navigation-read-screens:p1:inst-return-navigation
    return buildNavigation(registered.filter(isScreenExtension), domainKey, mountedId, NAV_GROUP_NAMES);
    // @cpt-end:cpt-site-algo-shell-layout-navigation-read-screens:p1:inst-return-navigation
  }, [registered, domainKey, mountedId, bootstrap, mfeRegistry]);

  // Dispatch is acceptance-only: it returns void and never throws.
  const open = useCallback(
    (extensionId: string) => {
      // @cpt-begin:cpt-site-flow-shell-layout-navigation-open-screen:p1:inst-dispatch-mount
      mfeRegistry?.executeActionsChain({ action: { type: FRONTX_ACTION_MOUNT_EXT, target: FRONTX_SCREEN_DOMAIN, payload: { subject: extensionId } } });
      // @cpt-end:cpt-site-flow-shell-layout-navigation-open-screen:p1:inst-dispatch-mount
    },
    [mfeRegistry]
  );

  return { entries, open };
}
