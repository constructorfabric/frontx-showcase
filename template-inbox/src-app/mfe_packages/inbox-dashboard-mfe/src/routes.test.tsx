import { resolveNavigationHistory } from '@gears-frontx/routing';
import { adaptProviderHistory, createRouter } from '@gears-frontx/routing-tanstack';
import { describe, expect, it } from 'vitest';
import { dashboardRouteTree } from './routes';

const router = createRouter({ routeTree: dashboardRouteTree, history: adaptProviderHistory(resolveNavigationHistory(), undefined) });

/** The deepest route an address inside the screen matches; `__root__` alone when no page of the screen matches. */
const leafOf = (path: string) => {
  const matches = router.matchRoutes(path, {});
  return matches[matches.length - 1];
};

describe('dashboardRouteTree', () => {
  it('matches the screen root', () => {
    expect(leafOf('/')?.routeId).toBe('/');
  });

  it('leaves every other path to the root, whose not-found page renders in place of the screen', () => {
    for (const path of ['/overview', '/a/b']) expect(leafOf(path)?.routeId, path).toBe('__root__');
    expect(dashboardRouteTree.options.notFoundComponent).toBeDefined();
  });
});
