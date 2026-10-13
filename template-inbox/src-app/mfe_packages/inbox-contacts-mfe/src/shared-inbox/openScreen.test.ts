import { describe, expect, it, vi } from 'vitest';
import { FRONTX_ACTION_MOUNT_EXT, FRONTX_SCREEN_DOMAIN, type FrontXApp } from '@gears-frontx/react';
import { createMfeBridgeFixture } from '@frontx-test-utils/createMfeBridgeFixture';
import { openScreen, SHOW_CONTACT_ACTION, ShowContactHandler } from '@inbox-shared/navigation/openScreen';
import { INBOX_SCREEN_EXTENSIONS, INBOX_SCREENS } from '@inbox-shared/navigation/screens';
import manifest from '../../mfe.json';

/** A domain other than the shell's screen domain: a bridge there has no screen domain to navigate in. */
const OTHER_DOMAIN_ID = 'gts.frontx.mfes.ext.domain.v1~frontx.widgets.area.main.v1';

const CONTACTS = INBOX_SCREEN_EXTENSIONS[INBOX_SCREENS.contacts];

const chatFixture = (inScreenDomain: boolean) =>
  createMfeBridgeFixture({
    extDomainId: inScreenDomain ? FRONTX_SCREEN_DOMAIN : OTHER_DOMAIN_ID,
    extensionId: INBOX_SCREEN_EXTENSIONS[INBOX_SCREENS.chat],
    initialProperties: {},
  });

/** An app whose navigation facade records the paths it is moved to. */
const recordingApp = () => {
  const replaced: string[] = [];
  const app = { mfeRouter: { navigation: () => ({ navigate: vi.fn(), replace: (path: string) => replaced.push(path), location: () => ({ pathname: '/', search: '' }) }) } } as unknown as FrontXApp;
  return { app, replaced };
};

describe('openScreen', () => {
  it("mounts the target screen, then sends it the target's typed action, in one chain", () => {
    const fixture = chatFixture(true);

    expect(openScreen(fixture.bridge, { screen: INBOX_SCREENS.contacts, action: { type: SHOW_CONTACT_ACTION, payload: { contact: 'r-42' } } })).toBe(true);

    expect(fixture.executeActionsChain).toHaveBeenCalledTimes(1);
    expect(fixture.executeActionsChain).toHaveBeenCalledWith({
      action: { type: FRONTX_ACTION_MOUNT_EXT, target: FRONTX_SCREEN_DOMAIN, payload: { subject: CONTACTS } },
      next: { action: { type: SHOW_CONTACT_ACTION, target: CONTACTS, payload: { contact: 'r-42' } } },
    });
  });

  it("opens the target's root with the mount alone when no action is named", () => {
    const fixture = chatFixture(true);

    openScreen(fixture.bridge, { screen: INBOX_SCREENS.contacts });

    expect(fixture.executeActionsChain).toHaveBeenCalledWith({ action: { type: FRONTX_ACTION_MOUNT_EXT, target: FRONTX_SCREEN_DOMAIN, payload: { subject: CONTACTS } } });
  });

  it("sends nothing and says so when the caller is not in the shell's screen domain", () => {
    const fixture = chatFixture(false);

    expect(openScreen(fixture.bridge, { screen: INBOX_SCREENS.contacts, action: { type: SHOW_CONTACT_ACTION, payload: { contact: 'r-1' } } })).toBe(false);
    expect(fixture.executeActionsChain).not.toHaveBeenCalled();
  });
});

describe('ShowContactHandler', () => {
  it("replaces the screen's own entry with the person's page through its navigation facade, the id encoded as one path segment", async () => {
    const { app, replaced } = recordingApp();
    const handler = new ShowContactHandler(app);

    await handler.handleAction(SHOW_CONTACT_ACTION, { contact: 'r-42' });
    await handler.handleAction(SHOW_CONTACT_ACTION, { contact: 'team/a?b' });

    expect(replaced).toEqual(['/r-42', `/${encodeURIComponent('team/a?b')}`]);
  });

  it('refuses a payload without a contact, or with an empty one, by rejecting, instead of moving anywhere', async () => {
    const { app, replaced } = recordingApp();

    await expect(new ShowContactHandler(app).handleAction(SHOW_CONTACT_ACTION, {})).rejects.toThrow(/no non-empty string contact/);
    await expect(new ShowContactHandler(app).handleAction(SHOW_CONTACT_ACTION, { contact: '' })).rejects.toThrow(/no non-empty string contact/);
    expect(replaced).toEqual([]);
  });

  it('is declared by the contacts entry, with its closed schema targeting only the contacts screen', () => {
    expect(manifest.entries[0]?.actions).toEqual([SHOW_CONTACT_ACTION]);
    expect(manifest.schemas.map((schema) => schema.$id)).toEqual([`gts://${SHOW_CONTACT_ACTION}`]);
    const [schema] = manifest.schemas;
    expect(schema?.additionalProperties).toBe(false);
    expect(schema?.properties.payload.additionalProperties).toBe(false);
    expect(schema?.properties.target['x-gts-ref']).toBe(CONTACTS);
    expect(schema?.properties.payload.required).toEqual(['contact']);
    expect(schema?.properties.payload.properties.contact).toMatchObject({ type: 'string', minLength: 1 });
  });
});
