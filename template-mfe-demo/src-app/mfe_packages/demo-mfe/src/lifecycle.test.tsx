import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createMfeBridgeFixture } from '@frontx-test-utils/createMfeBridgeFixture';
import { KitThemedLifecycle } from './shared/KitThemedLifecycle';

type BridgeFixture = ReturnType<typeof createMfeBridgeFixture>;
type TestBridge = BridgeFixture['bridge'];
type TestApp = { id: string };
type ActionPayload = Record<string, string | number | boolean | null>;

/** Renders Hello World's lifecycle content directly, as the lifecycle's own mount() does. */
async function mountHelloWorld(bridge: TestBridge): Promise<object> {
  const module = await import('./lifecycle-helloworld');
  const lifecycle: object = module.default;
  const renderContent = Reflect.get(lifecycle, 'renderContent') as (bridge: TestBridge) => React.ReactNode;
  render(<>{renderContent(bridge)}</>);
  await screen.findByTestId('hello-screen');
  return lifecycle;
}

const superMountSpy = vi.fn();
const fetchUserSpy = vi.fn();

vi.mock('@gears-frontx/react', async () => {
  // The framework's router needs the composed page; here the route tree is rendered over the page address with routing-tanstack itself, so each entry's real route tree is exercised.
  const routingTanstack = await vi.importActual<typeof import('@gears-frontx/routing-tanstack')>('@gears-frontx/routing-tanstack');
  const routing = await vi.importActual<typeof import('@gears-frontx/routing')>('@gears-frontx/routing');
  return {
  ExtensionRouter: ({ routeTree }: { routeTree: import('@gears-frontx/routing-tanstack').AnyRoute }) => (
    <routingTanstack.EngineProvider routeTree={routeTree} history={routingTanstack.adaptProviderHistory(routing.resolveNavigationHistory(), undefined)} />
  ),
  ActionHandler: class ActionHandler {
    static {
      void 0;
    }
  },
  ThemeAwareReactLifecycle: class ThemeAwareReactLifecycle {
    constructor(public readonly app: TestApp) {}

    mount(container: Element | ShadowRoot, bridge: TestBridge): void {
      superMountSpy(container, bridge);
    }
  },
  };
});

vi.mock('./init', () => ({
  mfeApp: { id: 'demo-mfe-app' },
  mfeRegistryOf: () => ({ id: 'demo-mfe-registry' }),
}));

vi.mock('./actions/profileActions', () => ({
  fetchUser: fetchUserSpy,
}));

vi.mock('./screens/helloworld/HelloWorldScreen', () => ({
  HelloWorldScreen: ({ bridge }: { bridge: { extensionId: string } }) => (
    <div data-testid="hello-screen">{bridge.extensionId}</div>
  ),
}));

vi.mock('./screens/profile/ProfileScreen', () => ({
  ProfileScreen: ({ bridge }: { bridge: { extDomainId: string } }) => (
    <div data-testid="profile-screen">{bridge.extDomainId}</div>
  ),
}));

vi.mock('./screens/theme/CurrentThemeScreen', () => ({
  CurrentThemeScreen: ({ bridge }: { bridge: { extensionId: string } }) => (
    <div data-testid="theme-screen">{bridge.extensionId}</div>
  ),
}));

describe('demo-mfe lifecycles', () => {
  it('renders the hello world lifecycle content', async () => {
    const { bridge } = createMfeBridgeFixture({
      extDomainId: 'demo-domain',
      extensionId: 'hello-instance',
    });

    const lifecycle = await mountHelloWorld(bridge);

    expect(Reflect.get(lifecycle, 'app')).toEqual({ id: 'demo-mfe-app' } satisfies TestApp);
    expect(screen.getByTestId('hello-screen').textContent).toContain('hello-instance');
  });

  it('renders the theme lifecycle content', async () => {
    const module = await import('./lifecycle-theme');
    const lifecycle = module.default;
    const renderContent = Reflect.get(lifecycle, 'renderContent') as (
      bridge: TestBridge,
    ) => React.ReactNode;
    const { bridge } = createMfeBridgeFixture({
      extDomainId: 'demo-domain',
      extensionId: 'theme-instance',
    });

    expect(Reflect.get(lifecycle, 'app')).toEqual({ id: 'demo-mfe-app' } satisfies TestApp);
    render(<>{renderContent(bridge)}</>);

    expect(await screen.findByTestId('theme-screen')).toHaveProperty(
      'textContent',
      expect.stringContaining('theme-instance'),
    );
  });

  /*
   * Which base class an entry extends is the whole of whether its screen gets
   * the kit's tokens, and getting it wrong is invisible from inside the entry:
   * `ThemeAwareReactLifecycle` mounts and themes the screen either way, and the
   * kit components simply paint from unresolved `var()` references. Every
   * screen of the package renders kit components, so every screen entry
   * carries the kit's tokens (the nested widgets host's own suite holds its
   * entry to the same base).
   */
  it('builds every screen on the lifecycle that carries the kit tokens', async () => {
    const entries = await Promise.all([
      import('./lifecycle-helloworld'),
      import('./lifecycle-profile'),
      import('./lifecycle-theme'),
    ]);

    for (const { default: lifecycle } of entries) {
      expect(lifecycle).toBeInstanceOf(KitThemedLifecycle);
    }
  });

  // `:root` matches no node in a shadow tree, so the kit's tokens only reach its
  // components once every selector position naming it names the host instead.
  it('re-anchors the ui-kit design tokens onto the shadow host it renders into', async () => {
    const module = await import('./lifecycle-helloworld');
    const initializeStyles = Reflect.get(module.default, 'initializeStyles') as (
      container: ShadowRoot
    ) => void;
    const shadowRoot = document.createElement('div').attachShadow({ mode: 'open' });

    initializeStyles.call(module.default, shadowRoot);
    // The shell keeps the shadow root across mounts: a second mount adds no second copy.
    initializeStyles.call(module.default, shadowRoot);

    expect(shadowRoot.querySelectorAll('style[data-kit-theme]')).toHaveLength(1);
    const injectedCss = shadowRoot.querySelector('style[data-kit-theme]')?.textContent ?? '';

    expect(injectedCss).toContain(':host {');
    // Not "no `:root` starts a line": a survivor mid-line matches nothing in a
    // shadow tree just as silently, so nothing named `:root` may remain at all.
    expect(injectedCss).not.toContain(':root');
    // And the dark block has to keep matching the host, which the functional
    // form is the only way to do: a featureless host matches `:host(...)` and
    // not a `:host:not(...)` compound.
    expect(injectedCss).toContain(":host(:not([data-theme='light']))");
  });

  it('registers the refresh handler after profile mount and delegates to fetchUser', async () => {
    const module = await import('./lifecycle-profile');
    const lifecycle = module.default as {
      mount: (container: Element, bridge: TestBridge) => void;
    };
    const renderContent = Reflect.get(lifecycle, 'renderContent') as (
      bridge: TestBridge,
    ) => React.ReactNode;
    const fixture = createMfeBridgeFixture({
      extDomainId: 'profile-domain',
      extensionId: 'profile-instance',
    });
    const container = document.createElement('div');

    expect(Reflect.get(lifecycle, 'app')).toEqual({ id: 'demo-mfe-app' } satisfies TestApp);
    render(<>{renderContent(fixture.bridge)}</>);

    expect((await screen.findByTestId('profile-screen')).textContent).toContain('profile-domain');

    lifecycle.mount(container, fixture.bridge);

    expect(superMountSpy).toHaveBeenCalledWith(container, fixture.bridge);
    expect(fixture.registerActionHandler).toHaveBeenCalledTimes(1);

    const [actionId, handler] = fixture.registerActionHandler.mock.calls[0] as [
      string,
      { handleAction: (actionTypeId: string, payload: ActionPayload | undefined) => Promise<void> },
    ];

    expect(actionId).toBe(
      'gts.frontx.mfes.comm.action.v1~frontx.demo.profile.refresh_profile.v1~'
    );

    await expect(handler.handleAction(actionId, undefined)).resolves.toBeUndefined();
    expect(fetchUserSpy).toHaveBeenCalledTimes(1);
  });
});
