// @vitest-environment node
import { resolveNavigationHistory, type AdapterLocation, type DomainKey, type ExtensionToken, type HistoryAdapter } from '@gears-frontx/routing';
import { adaptProviderHistory } from '@gears-frontx/routing-tanstack';
import { describe, expect, it } from 'vitest';
import { ROUTE_PARAM } from './page-map.ts';

/** A history adapter over memory, so the realm's navigation history exists without a browser window. */
function memoryAdapter(initial: string): HistoryAdapter {
  const parse = (address: string): AdapterLocation => {
    const url = new URL(address, 'http://localhost');
    return { path: url.pathname, search: url.search.replace(/^\?/, ''), hash: url.hash.replace(/^#/, '') };
  };
  let location = parse(initial);
  let state: unknown = null;
  return {
    getLocation: () => location,
    pushState: (path, next) => {
      location = parse(path);
      state = next;
    },
    replaceState: (path, next) => {
      location = parse(path);
      state = next;
    },
    getState: () => state,
    go: () => {},
    onPop: () => () => {},
  };
}

/**
 * The name of the entry parameter that carries a screen's path is a routing-tanstack convention it keeps internal; head-sync names it once (`ROUTE_PARAM`). This builds a screen router through routing-tanstack's public API in composed mode and fails if the convention ever changes.
 */
describe('the route parameter convention', () => {
  it(`projects ?screen=x;${ROUTE_PARAM}=a/b onto the virtual pathname /a/b`, () => {
    const history = resolveNavigationHistory(() => memoryAdapter(`/?screen=x;${ROUTE_PARAM}=a/b`));
    const routerHistory = adaptProviderHistory(history, { domainKey: 'screen' as DomainKey, extension: 'x' as ExtensionToken });
    expect(routerHistory.location.pathname).toBe('/a/b');
  });
});
