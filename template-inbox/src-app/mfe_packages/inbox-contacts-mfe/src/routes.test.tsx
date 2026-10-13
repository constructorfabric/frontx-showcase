import { resolveNavigationHistory } from '@gears-frontx/routing';
import { adaptProviderHistory, createRouter } from '@gears-frontx/routing-tanstack';
import { describe, expect, it } from 'vitest';
import { contactsRouteTree } from './routes';

const router = createRouter({ routeTree: contactsRouteTree, history: adaptProviderHistory(resolveNavigationHistory(), undefined) });

/** The deepest route an address inside the screen matches; `__root__` alone when no page of the screen matches. */
const leafOf = (path: string) => {
  const matches = router.matchRoutes(path, {});
  return matches[matches.length - 1];
};

describe('contactsRouteTree', () => {
  it('matches the directory at the screen root, under the layout that keeps it mounted', () => {
    const matches = router.matchRoutes('/', {});
    expect(matches.map((match) => match.routeId)).toEqual(['__root__', '/contacts', '/contacts/']);
  });

  it("matches a person's page and reads the id from its one segment", () => {
    const leaf = leafOf('/r-42');
    expect(leaf?.routeId).toBe('/contacts/$contactId');
    expect(leaf?.params).toMatchObject({ contactId: 'r-42' });
  });

  it("reads a deeper path by its first segment, as the router matches the person's page fuzzily", () => {
    expect(leafOf('/r-42/notes')?.routeId).toBe('/contacts/$contactId');
    expect(leafOf('/r-42/notes')?.params).toMatchObject({ contactId: 'r-42' });
  });

  it('gives the root a not-found page for an address no route matches', () => {
    expect(contactsRouteTree.options.notFoundComponent).toBeDefined();
  });
});
