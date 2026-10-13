/**
 * The FrontX runtime the inbox suites render a screen in, as the page gives it to a mounted screen.
 *
 * In the page the shell builds its app with `queryCache()`, which owns the page's one QueryClient, and every screen package's app joins it with `queryCacheShared()`; `ThemeAwareReactLifecycle` then renders the screen inside `FrontXProvider` with the package's app, which brings the package's store (its slices) and that shared cache. The shell's app lives in another runtime than the package's (one FrontX app per runtime), so `startTestHost` builds it in its own copy of the framework. Every runtime gets its own copy of every FrontX package, `@gears-frontx/state` (the event bus and the store) included, as in the page, where the MFE handler evaluates each loaded package over its own module graph (gears-frontx ADR 0011, MFE load isolation); what the runtimes share is what the page shares, the QueryClient and the shared fetch cache, which FrontX keeps on `globalThis`. FrontX's own query tests (`loadOtherRuntime`) share `@gears-frontx/state` instead, which would let the shell's cache listeners hear a package's events and is not how the page runs. `frontxWrapper` is the provider the lifecycle would wrap a screen in.
 *
 * The test runner's hooks come in as arguments rather than imports: this folder sits outside every package, and an import of `vitest` from here could resolve to another copy than the one running the package's suite.
 */
import type { ComponentType, ReactNode } from 'react';
import { peekSharedFetchCache } from '@gears-frontx/api';
import type { FrontXApp, FrontXProvider } from '@gears-frontx/react';

/** What these helpers need of the runner's module controls (`vi`). */
export type ModuleHooks = {
  resetModules: () => unknown;
};

import { buildInboxScreenApp } from '../lifecycle/screenApp';

type Runtime = typeof import('@gears-frontx/react');

let clearHostQueryClient: (() => void) | undefined;

/**
 * Loads a fresh copy of every FrontX package, as a separate runtime in the page has. Modules imported before the call keep the copy they had; what is imported after it gets the new one.
 */
async function loadRuntime(vi: ModuleHooks): Promise<Runtime> {
  vi.resetModules();
  return import('@gears-frontx/react');
}

/**
 * Builds the shell's app, owner of the page's QueryClient, in a runtime of its own, then starts the package's runtime afresh. Called once per test file from the package's setup, before the setup imports anything else, so the suite and the setup's resets share one copy of every module. Keep this module's own copy for `clearSharedQueryCache`: a copy imported after the call knows no host.
 */
export async function startTestHost(vi: ModuleHooks): Promise<void> {
  const host = await loadRuntime(vi);
  const app = host.createFrontX().use(host.queryCache()).build();
  const { resolveFrontXQueryClient } = await import('@gears-frontx/react/testing');
  const client = resolveFrontXQueryClient(app);
  clearHostQueryClient = () => {
    client?.clear();
    peekSharedFetchCache()?.clear();
  };
  vi.resetModules();
}

/** Forgets every read the shared query cache and the page's shared fetch cache hold. For tests, between cases. */
export const clearSharedQueryCache = (): void => {
  clearHostQueryClient?.();
};

/**
 * Another screen package's app in the same page, loading now: a runtime of its own whose app is built exactly as every inbox package builds its own (`buildInboxScreenApp`), so it joins the shared QueryClient and runs `mock()` as a real package does. Its hooks and provider are that runtime's; render through them.
 */
export async function startOtherScreenRuntime(vi: ModuleHooks): Promise<{ runtime: Runtime; app: FrontXApp }> {
  const runtime = await loadRuntime(vi);
  const app = buildInboxScreenApp(runtime);
  return { runtime, app };
}

type Wrapper = ComponentType<{ children: ReactNode }>;

/**
 * A Testing Library wrapper rendering inside `app`'s provider, around `inner` when a suite brings a wrapper of its own. `Provider` is the `FrontXProvider` of the runtime `app` was built in.
 */
export function frontxWrapper(Provider: typeof FrontXProvider, app: FrontXApp, inner?: Wrapper): Wrapper {
  const Inner = inner;
  return function FrontXTestProvider({ children }: { children: ReactNode }) {
    return <Provider app={app}>{Inner ? <Inner>{children}</Inner> : children}</Provider>;
  };
}
