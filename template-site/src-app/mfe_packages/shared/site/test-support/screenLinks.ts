import { fireEvent } from '@testing-library/react';
import { FRONTX_ACTION_MOUNT_EXT, FRONTX_SCREEN_DOMAIN, type ActionsChain, type ChildMfeBridge } from '@gears-frontx/react';
import { expect, vi } from 'vitest';

/**
 * The one chain a link to another screen sends, checking on the way that the link is one: the link role, in the tab order, no address of its own, and the same single chain on a click and on Enter.
 * @param bridge - the bridge the screen renders with
 * @param link - the link element
 */
export function chainOf(bridge: ChildMfeBridge, link: HTMLElement): ActionsChain {
  expect(link.hasAttribute('href')).toBe(false);
  expect(link.getAttribute('role')).toBe('link');
  // The attribute, not the property: jsdom reports tab index 0 for any anchor, focusable or not.
  expect(link.getAttribute('tabindex')).toBe('0');
  const execute = vi.spyOn(bridge, 'executeActionsChain');
  try {
    fireEvent.click(link);
    expect(execute).toHaveBeenCalledTimes(1);
    const chain = execute.mock.calls[0]?.[0] as ActionsChain;
    execute.mockClear();
    fireEvent.keyDown(link, { key: 'Enter' });
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute.mock.calls[0]?.[0]).toEqual(chain);
    return chain;
  } finally {
    execute.mockRestore();
  }
}

/**
 * The chain that opens a screen: `mount_ext` on the screen domain, and, when given, the screen's show action as the next step.
 * @param extension - the screen extension
 * @param show - the show action's type and payload
 */
export function openChain(extension: string, show?: { type: string; payload: Record<string, string> }): ActionsChain {
  const mount = { type: FRONTX_ACTION_MOUNT_EXT, target: FRONTX_SCREEN_DOMAIN, payload: { subject: extension } };
  return show === undefined ? { action: mount } : { action: mount, next: { action: { type: show.type, target: extension, payload: show.payload } } };
}
