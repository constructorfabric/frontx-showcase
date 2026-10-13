import type React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { FRONTX_SHARED_PROPERTY_LANGUAGE, FRONTX_SHARED_PROPERTY_THEME, ThemeAwareReactLifecycle, type MfeMountContext } from '@gears-frontx/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMfeBridgeFixture } from '@frontx-test-utils/createMfeBridgeFixture';
import { SHOW_COMPONENT_ACTION, ShowComponentHandler } from './frame/showComponent';
import lifecycle from './lifecycle';
import { catalogueRouteTree } from './routes';

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

afterEach(() => {
  routerProps.length = 0;
  document.body.replaceChildren();
});

describe('CatalogueLifecycle', () => {
  it('registers its show_component handler on the bridge when it mounts, passing the mount context on to the base mount', () => {
    const baseMount = vi.spyOn(ThemeAwareReactLifecycle.prototype, 'mount').mockImplementation(() => undefined);
    try {
      const fixture = createMfeBridgeFixture({ extDomainId: 'd', extensionId: 'e' });
      const container = document.createElement('div');
      const mountContext = {} as MfeMountContext;
      lifecycle.mount(container, fixture.bridge, mountContext);
      expect(baseMount).toHaveBeenCalledWith(container, fixture.bridge, mountContext);
      expect(fixture.registerActionHandler).toHaveBeenCalledWith(SHOW_COMPONENT_ACTION, expect.any(ShowComponentHandler));
    } finally {
      baseMount.mockRestore();
    }
  });

  it('is the theme-aware lifecycle, exported as the module default', () => {
    expect(lifecycle).toBeInstanceOf(ThemeAwareReactLifecycle);
  });

  it("anchors the kit's tokens on the shadow host, once however often it mounts", () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = host.attachShadow({ mode: 'open' });
    hooks.initializeStyles.call(lifecycle, root);
    hooks.initializeStyles.call(lifecycle, root);
    const styles = root.querySelectorAll('style[data-kit-theme]');
    expect(styles).toHaveLength(1);
    expect(styles[0]?.textContent).toContain(':host');
    expect(styles[0]?.textContent).not.toContain(':root');
  });

  it("renders the catalogue's route tree through the framework router over the package's own registry", async () => {
    const { bridge } = createMfeBridgeFixture({ extDomainId: 'd', extensionId: 'e' });
    render(<>{hooks.renderContent.call(lifecycle, bridge)}</>);
    await waitFor(() => expect(routerProps).toHaveLength(1));
    expect(routerProps[0]?.routeTree).toBe(catalogueRouteTree);
    expect(routerProps[0]?.registry).toBeTruthy();
  });

  it("scopes the kit's tokens to the shell's theme and follows the language's direction", async () => {
    const fixture = createMfeBridgeFixture({
      extDomainId: 'd',
      extensionId: 'e',
      initialProperties: { [FRONTX_SHARED_PROPERTY_THEME]: 'light', [FRONTX_SHARED_PROPERTY_LANGUAGE]: 'en' },
    });
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = host.attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    root.appendChild(container);
    render(<>{hooks.renderContent.call(lifecycle, fixture.bridge)}</>, { container });
    const frame = root.querySelector('[data-testid="screen-root"]');
    expect(frame?.getAttribute('data-theme')).toBe('light');
    expect(frame?.getAttribute('dir')).toBe('ltr');

    act(() => fixture.setProperty(FRONTX_SHARED_PROPERTY_THEME, 'dark'));
    act(() => fixture.setProperty(FRONTX_SHARED_PROPERTY_LANGUAGE, 'ar'));
    expect(frame?.getAttribute('data-theme')).toBe('dark');
    await waitFor(() => expect(frame?.getAttribute('dir')).toBe('rtl'));
    expect(host.dir).toBe('rtl');
  });
});
