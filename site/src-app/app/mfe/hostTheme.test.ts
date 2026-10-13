import { afterEach, describe, expect, it } from 'vitest';
import type { ThemeConfig } from '@gears-frontx/react';
import { stampHostTheme } from './hostTheme';

/** A theme registry double holding the current theme and its subscribers, the two members the stamp reads. */
function registryDouble(initial: ThemeConfig) {
  let current: ThemeConfig | undefined = initial;
  const listeners = new Set<() => void>();
  return {
    getCurrent: () => current,
    subscribe(callback: () => void) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    apply(next: ThemeConfig | undefined) {
      current = next;
      for (const listener of listeners) listener();
    },
    listenerCount: () => listeners.size,
  };
}

const light: ThemeConfig = { id: 'light', name: 'Light', appearance: 'light', variables: {} };
const dark: ThemeConfig = { id: 'dark', name: 'Dark', appearance: 'dark', variables: {} };

/** A screen host as the mount manager hands it to the slot root: an element with an open shadow root. */
function screenHost(): HTMLElement {
  const host = document.createElement('div');
  host.attachShadow({ mode: 'open' });
  return host;
}

/** Lets the slot root's mutation observer deliver its records. */
const observed = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('stampHostTheme', () => {
  const roots: HTMLElement[] = [];
  const slotRoot = () => {
    const root = document.createElement('div');
    document.body.append(root);
    roots.push(root);
    return root;
  };

  afterEach(() => {
    for (const root of roots.splice(0)) root.remove();
  });

  it('stamps the current appearance on every screen host already in the slot root, and nothing else', () => {
    const root = slotRoot();
    const host = screenHost();
    const plain = document.createElement('div');
    root.append(host, plain);
    stampHostTheme(root, registryDouble(light));
    expect(host.getAttribute('data-theme')).toBe('light');
    expect(plain.hasAttribute('data-theme')).toBe(false);
  });

  it('stamps a screen host added to the slot root later', async () => {
    const root = slotRoot();
    stampHostTheme(root, registryDouble(dark));
    const host = screenHost();
    root.append(host);
    await observed();
    expect(host.getAttribute('data-theme')).toBe('dark');
  });

  it('follows every appearance change of the theme registry', () => {
    const root = slotRoot();
    const host = screenHost();
    root.append(host);
    const registry = registryDouble(light);
    stampHostTheme(root, registry);
    registry.apply(dark);
    expect(host.getAttribute('data-theme')).toBe('dark');
    registry.apply(light);
    expect(host.getAttribute('data-theme')).toBe('light');
  });

  it('removes the stamp while the current theme declares no appearance', () => {
    const root = slotRoot();
    const host = screenHost();
    root.append(host);
    const registry = registryDouble(light);
    stampHostTheme(root, registry);
    registry.apply({ id: 'plain', name: 'Plain', variables: {} });
    expect(host.hasAttribute('data-theme')).toBe(false);
  });

  it('stops observing and unsubscribes when disposed', async () => {
    const root = slotRoot();
    const registry = registryDouble(light);
    const dispose = stampHostTheme(root, registry);
    expect(registry.listenerCount()).toBe(1);
    dispose();
    expect(registry.listenerCount()).toBe(0);
    const host = screenHost();
    root.append(host);
    await observed();
    registry.apply(dark);
    expect(host.hasAttribute('data-theme')).toBe(false);
  });
});
