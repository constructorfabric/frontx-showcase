import { describe, expect, it } from 'vitest';
import type { FrontXApp } from '@gears-frontx/react';
import { SHOW_GUIDE_ACTION } from '@site-shared/navigation/siteScreens';
import { showGuideHandler } from './showGuide';

/** An app whose navigation facade records the paths it is moved to. */
function recordingApp(withRouter = true) {
  const replaced: string[] = [];
  const navigation = { navigate: () => undefined, replace: (path: string) => void replaced.push(path), location: () => ({ pathname: '/', search: '' }) };
  const app = { mfeRouter: withRouter ? { navigation: () => navigation } : undefined } as unknown as FrontXApp;
  return { app, replaced };
}

describe('the show_guide handler', () => {
  it("replaces the docs screen's own entry with the named guide's page", async () => {
    const { app, replaced } = recordingApp();
    await showGuideHandler(app).handleAction(SHOW_GUIDE_ACTION, { guide: 'first-change' });
    expect(replaced).toEqual(['/first-change']);
  });

  it('refuses a payload without a string guide by rejecting, and moves nowhere', async () => {
    const { app, replaced } = recordingApp();
    await expect(showGuideHandler(app).handleAction(SHOW_GUIDE_ACTION, {})).rejects.toThrow(/no string guide/);
    expect(replaced).toEqual([]);
  });

  it('refuses to act in an app built without a router, by rejecting', async () => {
    await expect(showGuideHandler(recordingApp(false).app).handleAction(SHOW_GUIDE_ACTION, { guide: 'get-started' })).rejects.toThrow(/without microfrontends/);
  });
});
