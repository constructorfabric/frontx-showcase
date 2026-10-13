import type React from 'react';
import { act, render } from '@testing-library/react';
import { FRONTX_SHARED_PROPERTY_LANGUAGE, FRONTX_SHARED_PROPERTY_THEME, ThemeAwareReactLifecycle, type MfeMountContext } from '@gears-frontx/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMfeBridgeFixture } from '@frontx-test-utils/createMfeBridgeFixture';
import { ShowPageHandler } from '@site-shared/navigation/openScreen';
import { SHOW_GUIDE_ACTION } from '@site-shared/navigation/siteScreens';
import lifecycle, { DocsLifecycle } from './lifecycle';
import { docsRouteTree } from './routes';
import { contentLanguage, directionFor, shippedLanguages } from './shared/ScreenFrame';

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

describe('DocsLifecycle', () => {
  it('registers its show_guide handler on the bridge when it mounts, passing the mount context on to the base mount', () => {
    const baseMount = vi.spyOn(ThemeAwareReactLifecycle.prototype, 'mount').mockImplementation(() => undefined);
    try {
      const fixture = createMfeBridgeFixture({ extDomainId: 'd', extensionId: 'e' });
      const container = document.createElement('div');
      const mountContext = {} as MfeMountContext;
      lifecycle.mount(container, fixture.bridge, mountContext);
      expect(baseMount).toHaveBeenCalledWith(container, fixture.bridge, mountContext);
      expect(fixture.registerActionHandler).toHaveBeenCalledWith(SHOW_GUIDE_ACTION, expect.any(ShowPageHandler));
    } finally {
      baseMount.mockRestore();
    }
  });

  it('is the theme-aware lifecycle, exported as the module default', () => {
    expect(lifecycle).toBeInstanceOf(DocsLifecycle);
    expect(lifecycle).toBeInstanceOf(ThemeAwareReactLifecycle);
  });

  it("anchors the kit's tokens on the shadow host, once however often it mounts", () => {
    const root = shadowRoot();
    hooks.initializeStyles.call(lifecycle, root);
    hooks.initializeStyles.call(lifecycle, root);
    const styles = root.querySelectorAll('style[data-kit-theme]');
    expect(styles).toHaveLength(1);
    expect(styles[0]?.textContent).toContain(':host');
    expect(styles[0]?.textContent).not.toContain(':root');
  });

  // The brand reaches the screen from the document: the shell's head styles are adopted into the shadow root ahead of this node, so the node carries the kit's theme alone.
  it("carries the kit's theme alone, no brand token", () => {
    const root = shadowRoot();
    hooks.initializeStyles.call(lifecycle, root);
    expect(root.querySelector('style[data-kit-theme]')?.textContent).not.toContain('--site-');
  });

  it("renders the package's route tree through the framework router over the package's own registry", () => {
    const { bridge } = createMfeBridgeFixture({ extDomainId: 'd', extensionId: 'e' });
    render(<>{hooks.renderContent.call(lifecycle, bridge)}</>);
    expect(routerProps).toHaveLength(1);
    expect(routerProps[0]?.routeTree).toBe(docsRouteTree);
    expect(routerProps[0]?.registry).toBeTruthy();
  });

  it("scopes the kit's tokens to the shell's theme, and declares the language its text is in on the shadow host", () => {
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
    const host = root.host as HTMLElement;
    expect(frame?.getAttribute('data-theme')).toBe('light');
    expect(host.lang).toBe('en');

    // The screen ships English only: a right-to-left shell language leaves its English text left to right.
    act(() => fixture.setProperty(FRONTX_SHARED_PROPERTY_THEME, 'dark'));
    act(() => fixture.setProperty(FRONTX_SHARED_PROPERTY_LANGUAGE, 'ar'));
    expect(frame?.getAttribute('data-theme')).toBe('dark');
    expect(frame?.getAttribute('lang')).toBe('en');
    expect(frame?.getAttribute('dir')).toBe('ltr');
    expect(host.lang).toBe('en');
    expect(host.dir).toBe('ltr');
  });
});

describe('content language', () => {
  it('is the shell language when the screen ships it, with its direction, and the source language otherwise', () => {
    const shipped = shippedLanguages(['./screens/a/i18n/en.json', './screens/a/i18n/ar.json', './screens/b/i18n/en.json']);
    expect(shipped).toEqual(['en', 'ar']);
    expect(contentLanguage('ar', shipped)).toBe('ar');
    expect(directionFor(contentLanguage('ar', shipped))).toBe('rtl');
    expect(contentLanguage('he', shipped)).toBe('en');
    expect(directionFor(contentLanguage('he', shipped))).toBe('ltr');
  });
});
