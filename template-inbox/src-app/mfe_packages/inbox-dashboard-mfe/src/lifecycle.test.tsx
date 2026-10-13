import { act } from 'react';
import { waitFor, within } from '@testing-library/react';
import { renderScreen } from './test-support/renderScreen';
import type React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  FRONTX_SHARED_PROPERTY_LANGUAGE,
  FRONTX_SHARED_PROPERTY_THEME,
} from '@gears-frontx/react';
import { createMfeBridgeFixture } from '@frontx-test-utils/createMfeBridgeFixture';
import { InboxScreenLifecycle } from '@inbox-shared/lifecycle/InboxScreenLifecycle';
import lifecycle, { DashboardLifecycle } from './lifecycle';
import { t } from './test-support/translate';

const EXTENSION_ID = 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.inbox_dashboard.screens.dashboard.v1';

type Mounted = {
  shadowRoot: ShadowRoot;
  screen: ReturnType<typeof within>;
  setTheme: (theme: string) => void;
  setLanguage: (language: string) => void;
};

type LifecycleHooks = {
  initializeStyles: (container: ShadowRoot) => void;
  renderContent: (bridge: ReturnType<typeof createMfeBridgeFixture>['bridge']) => React.ReactNode;
};

const hooks = lifecycle as unknown as LifecycleHooks;

/**
 * Puts the lifecycle's styles and content into a shadow root at the page
 * address carrying `route` inside the screen domain's entry for the
 * dashboard, the parts of a mount this package owns: the base class's own
 * mount (the FrontX provider, host style adoption) is the shell's and tested
 * there. The screen reads the real services, answered by their mock plugins
 * the way `init.ts` switches them on.
 */
function mountAt(route: string | undefined): Mounted {
  // No shell composes the screen here, so its router reads the page path itself (the framework projects the screen's own entry onto that path in the shell).
  const address = route === undefined ? '/' : `/${route}`;
  window.history.replaceState(null, '', address);
  const fixture = createMfeBridgeFixture({
    extDomainId: 'gts.frontx.mfes.ext.domain.v1~frontx.screensets.layout.screen.v1',
    extensionId: EXTENSION_ID,
    initialProperties: {
      [FRONTX_SHARED_PROPERTY_THEME]: 'light',
      [FRONTX_SHARED_PROPERTY_LANGUAGE]: 'en',
    },
  });
  const host = document.createElement('div');
  document.body.appendChild(host);
  const shadowRoot = host.attachShadow({ mode: 'open' });
  hooks.initializeStyles.call(lifecycle, shadowRoot);
  const container = document.createElement('div');
  shadowRoot.appendChild(container);
  renderScreen(<>{hooks.renderContent.call(lifecycle, fixture.bridge)}</>, { container });
  return {
    shadowRoot,
    screen: within(container),
    setTheme: (theme) => act(() => fixture.setProperty(FRONTX_SHARED_PROPERTY_THEME, theme)),
    setLanguage: (language) => act(() => fixture.setProperty(FRONTX_SHARED_PROPERTY_LANGUAGE, language)),
  };
}

afterEach(() => {
  // Testing Library's cleanup unmounts the trees; the hosts go with the body.
  document.body.replaceChildren();
});

describe('DashboardLifecycle', () => {
  it('is the inbox screen lifecycle, exported as the module default', () => {
    expect(lifecycle).toBeInstanceOf(DashboardLifecycle);
    expect(lifecycle).toBeInstanceOf(InboxScreenLifecycle);
  });

  it("anchors the kit's tokens on the shadow host, including the dark block", () => {
    const { shadowRoot } = mountAt(undefined);
    const css = Array.from(shadowRoot.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n');

    expect(css).toContain(':host');
    expect(css).toContain('--background');
    expect(css).toContain(":host(:not([data-theme='light']))");
  });

  it('renders the overview at the screen root from the mocked services, inside a frame carrying the kit theme scope', async () => {
    const { shadowRoot, screen, setTheme } = mountAt(undefined);

    expect(await screen.findByRole('heading', { level: 1, name: t('dashboard') })).toBeTruthy();
    expect(screen.getByText(t('recent_activity'))).toBeTruthy();
    const frame = shadowRoot.querySelector('[data-theme]');
    expect(frame?.getAttribute('data-theme')).toBe('light');
    expect(frame?.getAttribute('dir')).toBe('ltr');

    setTheme('dark');
    expect(frame?.getAttribute('data-theme')).toBe('dark');
  });

  it('turns the frame and the shadow host right to left for a right-to-left language, and back', async () => {
    const mounted = mountAt(undefined);
    await mounted.screen.findByRole('heading', { level: 1, name: t('dashboard') });
    const frame = mounted.shadowRoot.querySelector('[data-theme]');

    mounted.setLanguage('ar-SA');
    expect(frame?.getAttribute('dir')).toBe('rtl');
    expect((mounted.shadowRoot.host as HTMLElement).dir).toBe('rtl');

    mounted.setLanguage('en');
    expect(frame?.getAttribute('dir')).toBe('ltr');
  });

  it('gives the charts their text alternatives inside the shadow root', async () => {
    const { screen } = mountAt(undefined);
    await screen.findByRole('heading', { level: 1, name: t('dashboard') });

    const names: string[] = screen.getAllByRole('img').map((chart: HTMLElement) => chart.getAttribute('aria-label') ?? '');
    expect(names.some((name) => name.startsWith(`${t('resolved_per_day')}: `))).toBe(true);
    for (const name of names) expect(name).not.toMatch(/[{}]|chart_/);
  });

  it('leaves no tab stop inside the charts it hides from assistive technology', async () => {
    const { shadowRoot, screen } = mountAt(undefined);
    await screen.findByRole('heading', { level: 1, name: t('dashboard') });

    const hidden = Array.from(shadowRoot.querySelectorAll('[aria-hidden="true"]'));
    expect(hidden.some((node) => node.querySelector('svg') !== null)).toBe(true);
    const focusable = hidden.flatMap((node) =>
      Array.from(node.querySelectorAll<HTMLElement | SVGElement>('[tabindex]'))
        .filter((element) => element.tabIndex >= 0)
        .map((element) => `${element.tagName}.${element.getAttribute('class') ?? ''}`)
    );
    expect(focusable).toEqual([]);
  });

  it('keeps the portal node inside the shadow root, ahead of the screen', async () => {
    const { shadowRoot, screen } = mountAt(undefined);
    await screen.findByRole('heading', { level: 1, name: t('dashboard') });

    const portal = shadowRoot.querySelector('[data-inbox-portal]');
    expect(portal).not.toBeNull();
    expect(portal?.getRootNode()).toBe(shadowRoot);
    expect(portal?.parentElement?.firstElementChild).toBe(portal);
  });

  it("answers an address that names no page of the screen with the screen's own not-found, in place of the overview", async () => {
    const { shadowRoot, screen } = mountAt('overview');

    await waitFor(() => expect(shadowRoot.querySelector('[data-testid="dashboard-route-not-found"]')).not.toBeNull());
    expect(screen.queryByRole('heading', { level: 1, name: t('dashboard') })).toBeNull();
  });

  it('moves focus to the heading when the screen mounts', async () => {
    const { shadowRoot, screen } = mountAt(undefined);
    const heading = await screen.findByRole('heading', { level: 1, name: t('dashboard') });
    await waitFor(() => expect(shadowRoot.activeElement).toBe(heading));
  });

  it('leaves the document title to the site (head-sync applies the screen metadata)', async () => {
    const { screen } = mountAt(undefined);
    await screen.findByRole('heading', { level: 1, name: t('dashboard') });

    expect(document.title).toBe('');
  });
});
