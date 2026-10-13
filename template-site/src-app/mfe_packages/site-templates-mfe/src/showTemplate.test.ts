import { describe, expect, it } from 'vitest';
import type { FrontXApp } from '@gears-frontx/react';
import { SHOW_TEMPLATE_ACTION } from '@site-shared/navigation/siteScreens';
import { showTemplateHandler } from './showTemplate';

/** An app whose navigation facade records the paths it is moved to. */
function recordingApp(withRouter = true) {
  const replaced: string[] = [];
  const navigation = { navigate: () => undefined, replace: (path: string) => void replaced.push(path), location: () => ({ pathname: '/', search: '' }) };
  const app = { mfeRouter: withRouter ? { navigation: () => navigation } : undefined } as unknown as FrontXApp;
  return { app, replaced };
}

describe('the show_template handler', () => {
  it("replaces the templates screen's own entry with the named template's page", async () => {
    const { app, replaced } = recordingApp();
    await showTemplateHandler(app).handleAction(SHOW_TEMPLATE_ACTION, { template: 'template-shell' });
    expect(replaced).toEqual(['/template-shell']);
  });

  it('refuses a payload without a string template by rejecting, and moves nowhere', async () => {
    const { app, replaced } = recordingApp();
    await expect(showTemplateHandler(app).handleAction(SHOW_TEMPLATE_ACTION, { guide: 'template-shell' })).rejects.toThrow(/no string template/);
    expect(replaced).toEqual([]);
  });

  it('refuses to act in an app built without a router, by rejecting', async () => {
    await expect(showTemplateHandler(recordingApp(false).app).handleAction(SHOW_TEMPLATE_ACTION, { template: 'template-shell' })).rejects.toThrow(/without microfrontends/);
  });
});
