import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FRONTX_ACTION_MOUNT_EXT, FRONTX_SCREEN_DOMAIN } from '@gears-frontx/react';
import { createMfeBridgeFixture } from '@frontx-test-utils/createMfeBridgeFixture';
import { InboxScreenContext } from '@inbox-shared/lifecycle/screenContext';
import { SHOW_CONTACT_ACTION } from '@inbox-shared/navigation/openScreen';
import { INBOX_SCREEN_EXTENSIONS, INBOX_SCREENS } from '@inbox-shared/navigation/screens';
import { t } from '../../test-support/translate';
import { useChatNavigation } from './chatNavigation';

/** A domain other than the shell's screen domain: a bridge there has no screen domain to navigate in. */
const OTHER_DOMAIN_ID = 'gts.frontx.mfes.ext.domain.v1~frontx.widgets.area.main.v1';

const CONTACTS = INBOX_SCREEN_EXTENSIONS[INBOX_SCREENS.contacts];

const frameWith = (inScreenDomain: boolean) => {
  const fixture = createMfeBridgeFixture({
    extDomainId: inScreenDomain ? FRONTX_SCREEN_DOMAIN : OTHER_DOMAIN_ID,
    extensionId: INBOX_SCREEN_EXTENSIONS[INBOX_SCREENS.chat],
    initialProperties: {},
  });
  const portalContainer = { current: null };
  const wrapper = ({ children }: { children: ReactNode }) => (
    <InboxScreenContext.Provider value={{ bridge: fixture.bridge, t, portalContainer }}>{children}</InboxScreenContext.Provider>
  );
  return { fixture, wrapper };
};

describe('useChatNavigation', () => {
  it("opens the contact's page in the contacts screen with one chain, the id passed as it is to the contacts screen's show_contact", () => {
    const { fixture, wrapper } = frameWith(true);
    const { result } = renderHook(() => useChatNavigation(), { wrapper });

    result.current.viewContact?.('team/a?b');

    expect(fixture.executeActionsChain).toHaveBeenCalledTimes(1);
    expect(fixture.executeActionsChain).toHaveBeenCalledWith({
      action: { type: FRONTX_ACTION_MOUNT_EXT, target: FRONTX_SCREEN_DOMAIN, payload: { subject: CONTACTS } },
      next: { action: { type: SHOW_CONTACT_ACTION, target: CONTACTS, payload: { contact: 'team/a?b' } } },
    });
  });

  it("offers no contact link outside the shell's screen domain, nor outside a frame", () => {
    const { fixture, wrapper } = frameWith(false);

    expect(renderHook(() => useChatNavigation(), { wrapper }).result.current.viewContact).toBeUndefined();
    expect(renderHook(() => useChatNavigation()).result.current.viewContact).toBeUndefined();
    expect(fixture.executeActionsChain).not.toHaveBeenCalled();
  });
});
