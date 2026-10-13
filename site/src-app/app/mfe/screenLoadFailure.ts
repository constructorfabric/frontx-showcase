/**
 * The screen the screen domain last failed to mount, if the latest mount failed: a remote that does not load (its files missing or unreachable) or a lifecycle that throws. The screen domain's mount handler (`bootstrap.ts`) reports and clears it; the screen container reads it and shows an error state with a retry instead of an empty page.
 */
import { useSyncExternalStore } from 'react';

/** The history intent a `mount_ext` action carries; an action without one pushes. */
export type MountHistoryIntent = 'push' | 'replace' | 'none';

export interface ScreenLoadFailure {
  /** The screen extension the failed mount named, when the action named one. */
  readonly extensionId: string | undefined;
  /** The history intent of the failed action, so the retry keeps what the visitor asked for (a header click pushes, a URL-driven mount writes nothing). */
  readonly history: MountHistoryIntent;
}

type Listener = () => void;

// @cpt-dod:cpt-site-dod-shell-layout-navigation-load-failure:p1
// @cpt-state:cpt-site-state-shell-layout-navigation-load-failure:p1
function createScreenLoadFailureStore() {
  let failure: ScreenLoadFailure | undefined;
  const listeners = new Set<Listener>();
  const set = (next: ScreenLoadFailure | undefined) => {
    failure = next;
    for (const listener of listeners) listener();
  };
  return {
    current: (): ScreenLoadFailure | undefined => failure,
    // @cpt-begin:cpt-site-state-shell-layout-navigation-load-failure:p1:inst-report
    report: (extensionId: string | undefined, history: MountHistoryIntent): void => set({ extensionId, history }),
    // @cpt-end:cpt-site-state-shell-layout-navigation-load-failure:p1:inst-report
    // @cpt-begin:cpt-site-state-shell-layout-navigation-load-failure:p1:inst-clear
    clear: (): void => {
      if (failure !== undefined) set(undefined);
    },
    // @cpt-end:cpt-site-state-shell-layout-navigation-load-failure:p1:inst-clear
    subscribe: (listener: Listener): (() => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** One per page, like the bootstrap it belongs to (`bootstrapOnce.ts`). */
export const screenLoadFailure = createScreenLoadFailureStore();

/** The current screen load failure, re-rendering on every change. */
export function useScreenLoadFailure(): ScreenLoadFailure | undefined {
  return useSyncExternalStore(screenLoadFailure.subscribe, screenLoadFailure.current);
}
