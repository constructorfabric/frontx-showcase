import { describe, expect, it } from 'vitest';
import { INBOX_SCREEN_EXTENSIONS, INBOX_SCREENS } from '@inbox-shared/navigation/screens';

type Manifest = { extensions: { id: string; route?: string; presentation?: { order?: number } }[] };

/**
 * Every landed inbox package's manifest, read as data by the test runner (a
 * glob, not an import: no package's code depends on another's). Vite writes
 * each key relative to this file, shortest form first (`../../mfe.json` for
 * this package's own), so the directory is read off the resolved URL.
 */
const manifests = import.meta.glob<Manifest>('../../../inbox-*-mfe/mfe.json', { eager: true, import: 'default' });

/** The screen route each landed package declares, by package directory. */
const declaredRoutes = (): Map<string, string> => {
  const routes = new Map<string, string>();
  for (const [file, manifest] of Object.entries(manifests)) {
    const segments = new URL(file, import.meta.url).pathname.split('/');
    const directory = segments[segments.length - 2] ?? file;
    for (const extension of manifest.extensions) {
      if (extension.route) routes.set(directory, extension.route);
    }
  }
  return routes;
};

describe('INBOX_SCREENS', () => {
  it("names each landed package's screen by the route its manifest declares", () => {
    const routes = declaredRoutes();

    expect(routes.get('inbox-contacts-mfe')).toBe(`/${INBOX_SCREENS.contacts}`);
    const tokens = new Set<string>(Object.values(INBOX_SCREENS));
    for (const [directory, route] of routes) {
      expect(tokens.has(route.replace(/^\//, '')), `${directory} declares ${route}`).toBe(true);
      expect(route).toBe(`/${directory.replace(/-mfe$/, '')}`);
    }
  });

  it('names each screen extension by the id its manifest declares', () => {
    const ids = new Map<string, string>();
    for (const manifest of Object.values(manifests)) {
      for (const extension of manifest.extensions) if (extension.route) ids.set(extension.route.replace(/^\//, ''), extension.id);
    }
    expect(Object.fromEntries(ids)).toEqual(INBOX_SCREEN_EXTENSIONS);
  });

  it('orders the four screens 61 to 64 in the menu: contacts, dashboard, chat, mail', () => {
    const orders = Object.entries(manifests)
      .map(([file, manifest]) => { const segments = new URL(file, import.meta.url).pathname.split('/'); return [segments[segments.length - 2], manifest.extensions[0]?.presentation?.order] as const; })
      .sort((a, b) => (a[1] ?? 0) - (b[1] ?? 0));
    expect(orders.map(([directory]) => directory)).toEqual(['inbox-contacts-mfe', 'inbox-dashboard-mfe', 'inbox-chat-mfe', 'inbox-mail-mfe']);
    expect(orders.map(([, order]) => order)).toEqual([61, 62, 63, 64]);
  });
});
