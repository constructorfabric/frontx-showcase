import { resolveNavigationHistory } from '@gears-frontx/routing';
import { adaptProviderHistory, createRouter, type AnyRoute } from '@gears-frontx/routing-tanstack';

/**
 * The paths of a route tree's pages, as the router registers them (the root and pathless layout routes excluded): static paths such as `/week`, and patterns such as `/components/$slug`.
 * @param routeTree - the package's route tree
 */
export function routeTreePaths(routeTree: AnyRoute): string[] {
  const router = createRouter({ routeTree, history: adaptProviderHistory(resolveNavigationHistory(), undefined) });
  return Object.keys(router.routesByPath)
    .filter((path) => path !== '')
    .sort();
}
