import { describe, expect, it } from 'vitest';
import type { FrontXApp } from '@gears-frontx/react';
import { SHOW_COMPONENT_ACTION, ShowComponentHandler } from './showComponent';

/** An app whose navigation facade records the paths it is moved to. */
function recordingApp(withRouter = true) {
  const replaced: string[] = [];
  const navigation = { navigate: () => undefined, replace: (path: string) => void replaced.push(path), location: () => ({ pathname: '/', search: '' }) };
  const app = { mfeRouter: withRouter ? { navigation: () => navigation } : undefined } as unknown as FrontXApp;
  return { app, replaced };
}

describe('ShowComponentHandler', () => {
  it("replaces the catalogue's own entry with the named component's page", async () => {
    const { app, replaced } = recordingApp();
    await new ShowComponentHandler(app).handleAction(SHOW_COMPONENT_ACTION, { component: 'button' });
    expect(replaced).toEqual(['/components/button']);
  });

  it('refuses a payload without a string component by rejecting, and moves nowhere', async () => {
    const { app, replaced } = recordingApp();
    await expect(new ShowComponentHandler(app).handleAction(SHOW_COMPONENT_ACTION, { component: 1 })).rejects.toThrow(/no string component/);
    expect(replaced).toEqual([]);
  });

  it('refuses to act in an app built without a router, by rejecting', async () => {
    await expect(new ShowComponentHandler(recordingApp(false).app).handleAction(SHOW_COMPONENT_ACTION, { component: 'button' })).rejects.toThrow(/without microfrontends/);
  });
});
