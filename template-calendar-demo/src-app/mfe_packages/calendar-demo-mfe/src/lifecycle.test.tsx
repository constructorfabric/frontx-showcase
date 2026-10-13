import type React from 'react';
import { act, render } from '@testing-library/react';
import { FRONTX_SHARED_PROPERTY_LANGUAGE, FRONTX_SHARED_PROPERTY_THEME, ThemeAwareReactLifecycle } from '@gears-frontx/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMfeBridgeFixture } from '@frontx-test-utils/createMfeBridgeFixture';
import lifecycle, { CalendarDemoLifecycle } from './lifecycle';
import { calendarRouteTree } from './routes';

const { routerProps } = vi.hoisted(() => ({ routerProps: [] as Array<{ registry: unknown; routeTree: unknown }> }));

// The framework's router needs the composed page; here it only has to receive this package's registry and route tree.
vi.mock('@gears-frontx/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@gears-frontx/react')>();
  return {
    ...actual,
    ExtensionRouter: (props: { registry: unknown; routeTree: unknown }) => {
      routerProps.push(props);
      return <div data-testid="extension-router" />;
    },
  };
});

type Hooks = {
  initializeStyles: (container: ShadowRoot) => void;
  renderContent: (bridge: ReturnType<typeof createMfeBridgeFixture>['bridge']) => React.ReactNode;
};
const hooks = lifecycle as unknown as Hooks;

function shadowRoot(): ShadowRoot {
  const host = document.createElement('div');
  document.body.appendChild(host);
  return host.attachShadow({ mode: 'open' });
}

afterEach(() => {
  routerProps.length = 0;
  document.body.replaceChildren();
});

describe('CalendarDemoLifecycle', () => {
  it('is the theme-aware lifecycle, exported as the module default', () => {
    expect(lifecycle).toBeInstanceOf(CalendarDemoLifecycle);
    expect(lifecycle).toBeInstanceOf(ThemeAwareReactLifecycle);
  });

  it("puts the kit's token sheet into the shadow root once, however often it mounts", () => {
    const root = shadowRoot();
    hooks.initializeStyles.call(lifecycle, root);
    hooks.initializeStyles.call(lifecycle, root);
    const styles = root.querySelectorAll('style[data-kit-theme]');
    expect(styles).toHaveLength(1);
    const css = styles[0]?.textContent ?? '';
    // The ui-kit's tokens, re-anchored on the shadow host.
    expect(css).toContain('--background');
    expect(css).toContain(":host(:not([data-theme='light']))");
    expect(css).not.toMatch(/:root\b/);
  });

  it("renders the package's route tree through the framework router over the package's own registry", () => {
    const { bridge } = createMfeBridgeFixture({ extDomainId: 'd', extensionId: 'e' });
    render(<>{hooks.renderContent.call(lifecycle, bridge)}</>);
    expect(routerProps).toHaveLength(1);
    expect(routerProps[0]?.routeTree).toBe(calendarRouteTree);
    expect(routerProps[0]?.registry).toBeTruthy();
  });

  it("scopes the kit's tokens to the shell's theme and follows the language's direction", () => {
    const fixture = createMfeBridgeFixture({
      extDomainId: 'd',
      extensionId: 'e',
      initialProperties: { [FRONTX_SHARED_PROPERTY_THEME]: 'light', [FRONTX_SHARED_PROPERTY_LANGUAGE]: 'en' },
    });
    const root = shadowRoot();
    const container = document.createElement('div');
    root.appendChild(container);
    render(<>{hooks.renderContent.call(lifecycle, fixture.bridge)}</>, { container });
    const frame = root.querySelector('[data-testid="screen-root"]');
    expect(frame?.getAttribute('data-theme')).toBe('light');
    expect(frame?.getAttribute('dir')).toBe('ltr');

    act(() => fixture.setProperty(FRONTX_SHARED_PROPERTY_THEME, 'dark'));
    act(() => fixture.setProperty(FRONTX_SHARED_PROPERTY_LANGUAGE, 'ar'));
    expect(frame?.getAttribute('data-theme')).toBe('dark');
    expect(frame?.getAttribute('dir')).toBe('rtl');
    // Overlays the kit opens at the shadow root's top level resolve the same scope and direction from the host.
    expect((root.host as HTMLElement).dataset.theme).toBe('dark');
    expect((root.host as HTMLElement).dir).toBe('rtl');
  });
});
