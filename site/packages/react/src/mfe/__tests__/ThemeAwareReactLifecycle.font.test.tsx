/**
 * The base resets' typeface. The resets paint every screen's and widget's shadow
 * host, so a fixed font stack there would override the theme's typeface on every
 * host the shell does not reach from the outer tree (a widget nested in a
 * screen's shadow root). The resets read the theme's `--font-sans`, as they read
 * `--foreground` and `--background`, and keep the system stack as its fallback.
 */
import type React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import type { ChildMfeBridge } from '@gears-frontx/framework';

let ThemeAwareReactLifecycle: typeof import('../ThemeAwareReactLifecycle')['ThemeAwareReactLifecycle'];
let createFrontX: typeof import('@gears-frontx/framework')['createFrontX'];

beforeEach(async () => {
  vi.resetModules();
  ({ createFrontX } = await import('@gears-frontx/framework'));
  ({ ThemeAwareReactLifecycle } = await import('../ThemeAwareReactLifecycle'));
});

describe('ThemeAwareReactLifecycle base resets', () => {
  it("set the host's typeface from the theme's --font-sans, with the system stack as its fallback", async () => {
    const Probe = class extends ThemeAwareReactLifecycle {
      protected renderContent(_bridge: ChildMfeBridge): React.ReactNode {
        return null;
      }
    };
    const shadowRoot = document.createElement('div').attachShadow({ mode: 'open' });
    await act(async () => {
      new Probe(createFrontX().build()).mount(shadowRoot, {} as ChildMfeBridge);
    });
    const resets = shadowRoot.querySelector('style[id="__frontx-base-resets__"]')?.textContent ?? '';
    expect(resets).toMatch(/:host\s*\{[^}]*font-family:\s*var\(--font-sans,\s*system-ui\b/);
  });
});
