import { act } from 'react';
import { waitFor, within } from '@testing-library/react';
import { renderScreen } from './test-support/renderScreen';
import type React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  FRONTX_SHARED_PROPERTY_LANGUAGE,
  FRONTX_SHARED_PROPERTY_THEME,
  ThemeAwareReactLifecycle,
  type MfeMountContext,
} from '@gears-frontx/react';
import { createMfeBridgeFixture } from '@frontx-test-utils/createMfeBridgeFixture';
import { InboxScreenLifecycle, KIT_THEME_STYLE_ATTRIBUTE } from '@inbox-shared/lifecycle/InboxScreenLifecycle';
import { SHOW_CONTACT_ACTION, ShowContactHandler } from '@inbox-shared/navigation/openScreen';
import lifecycle, { ContactsLifecycle } from './lifecycle';
import { t } from './test-support/translate';

const EXTENSION_ID = 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.inbox_contacts.screens.contacts.v1';

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
 * path of `route` for contacts,
 * the parts of a mount this package owns: the base class's own mount (the
 * FrontX provider, host style adoption) is the shell's and tested there. The
 * screen domain is the domain the shell mounts it in.
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

describe('ContactsLifecycle', () => {
  it("registers the show_contact handler another screen's chain shows a person's page with, passing the mount context on to the base mount", () => {
    const baseMount = vi.spyOn(ThemeAwareReactLifecycle.prototype, 'mount').mockImplementation(() => undefined);
    try {
      const fixture = createMfeBridgeFixture({ extDomainId: 'd', extensionId: 'e' });
      const container = document.createElement('div');
      const mountContext = {} as MfeMountContext;
      lifecycle.mount(container, fixture.bridge, mountContext);
      expect(baseMount).toHaveBeenCalledWith(container, fixture.bridge, mountContext);
      expect(fixture.registerActionHandler).toHaveBeenCalledWith(SHOW_CONTACT_ACTION, expect.any(ShowContactHandler));
    } finally {
      baseMount.mockRestore();
    }
  });

  it('is the inbox screen lifecycle, exported as the module default', () => {
    expect(lifecycle).toBeInstanceOf(ContactsLifecycle);
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

  it('renders the directory at the screen root, inside a frame carrying the kit theme scope', async () => {
    const { shadowRoot, screen, setTheme } = mountAt(undefined);

    expect(await screen.findByRole('heading', { level: 1, name: t('all_contacts') })).toBeTruthy();
    const frame = shadowRoot.querySelector('[data-theme]');
    expect(frame?.getAttribute('data-theme')).toBe('light');
    expect(frame?.getAttribute('dir')).toBe('ltr');

    setTheme('dark');
    expect(frame?.getAttribute('data-theme')).toBe('dark');
  });

  it('puts the kit tokens into a shadow root once, however often the screen mounts into it', () => {
    const { shadowRoot } = mountAt(undefined);
    // The shell keeps the shadow root across unmount and mount and styles it
    // on every mount.
    hooks.initializeStyles.call(lifecycle, shadowRoot);
    hooks.initializeStyles.call(lifecycle, shadowRoot);

    expect(shadowRoot.querySelectorAll(`style[${KIT_THEME_STYLE_ATTRIBUTE}]`)).toHaveLength(1);
  });

  it('turns the frame and the shadow host right to left for a regional right-to-left language', async () => {
    const { shadowRoot, screen, setLanguage } = mountAt(undefined);
    await screen.findByRole('heading', { level: 1, name: t('all_contacts') });

    setLanguage('ar-SA');

    expect(shadowRoot.querySelector('[data-theme]')?.getAttribute('dir')).toBe('rtl');
    expect((shadowRoot.host as HTMLElement).dir).toBe('rtl');
  });

  it('keeps the portal node inside the shadow root, ahead of the screen', async () => {
    const { shadowRoot, screen } = mountAt(undefined);
    await screen.findByRole('heading', { level: 1, name: t('all_contacts') });

    const portal = shadowRoot.querySelector('[data-inbox-portal]');
    expect(portal).not.toBeNull();
    expect(portal?.getRootNode()).toBe(shadowRoot);
    expect(portal?.parentElement?.firstElementChild).toBe(portal);
  });

  it("opens a person's page from the route inside the screen's entry", async () => {
    const { screen } = mountAt('r-1');

    expect(await screen.findByText(t('qualification'))).toBeTruthy();
    // The directory stays mounted behind the page, hidden, its title as plain text: the person's name is the one h1.
    expect(screen.getByText(t('all_contacts'), { selector: 'span' })).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 1, hidden: true }).map((heading: HTMLElement) => heading.textContent)).toEqual(['Grace Park']);
  });

  it('says a contact was not found for a route naming no contact', async () => {
    const { screen } = mountAt('r-9999');

    expect(await screen.findByRole('heading', { level: 1, name: t('contact_not_found_title') })).toBeTruthy();
  });

  it("reads an encoded id carrying a slash as one person id: the person page says no such person, the route tree's not-found page stays out", async () => {
    const { shadowRoot, screen } = mountAt(encodeURIComponent(encodeURIComponent('r/1')));

    // The grammar writes the encoded segment's `%` as `%25`, as the `show_contact`
    // handler's replace does; the router decodes the segment into one id, which names nobody.
    expect(await screen.findByRole('heading', { level: 1, name: t('contact_not_found_title') })).toBeTruthy();
    expect(shadowRoot.querySelector('[data-testid="contacts-route-not-found"]')).toBeNull();
  });

  it("answers an address that names no page of the screen with the screen's own not-found", async () => {
    const { shadowRoot, screen } = mountAt('r-1/extra');

    await waitFor(() => expect(shadowRoot.querySelector('[data-testid="contacts-route-not-found"]')).not.toBeNull());
    // The not-found page stands alone: no directory, and one screen heading.
    expect(screen.queryByRole('heading', { level: 1, hidden: true, name: t('all_contacts') })).toBeNull();
    expect(screen.getAllByRole('heading', { level: 1, hidden: true })).toHaveLength(1);
  });

  it("moves focus to the heading when the screen mounts, and to the new page's heading when the screen's route changes", async () => {
    const { shadowRoot, screen } = mountAt(undefined);
    const opened = await screen.findByRole('heading', { level: 1, name: t('all_contacts') });
    await waitFor(() => expect(shadowRoot.activeElement).toBe(opened));

    act(() => screen.getAllByLabelText(t('view_contact'))[0].click());
    const heading = await screen.findByRole('heading', { level: 1, name: 'Grace Park' });
    await waitFor(() => expect(shadowRoot.activeElement).toBe(heading));

    act(() => screen.getByLabelText(t('back_to_contacts')).click());
    const directory = await screen.findByRole('heading', { level: 1, name: t('all_contacts') });
    await waitFor(() => expect(shadowRoot.activeElement).toBe(directory));
  });

  it("goes back to the directory in place of the person's page in the history, so the browser's Back never returns to it", async () => {
    const { screen } = mountAt(undefined);
    await screen.findByRole('heading', { level: 1, name: t('all_contacts') });

    act(() => screen.getAllByLabelText(t('view_contact'))[0].click());
    await screen.findByRole('heading', { level: 1, name: 'Grace Park' });
    const entries = window.history.length;

    act(() => screen.getByLabelText(t('back_to_contacts')).click());
    await screen.findByRole('heading', { level: 1, name: t('all_contacts') });
    expect(window.history.length).toBe(entries);
    expect(window.location.pathname).toBe('/');
  });

  it('leaves the document title to the site (head-sync applies the screen metadata)', async () => {
    const { screen } = mountAt(undefined);
    await screen.findByRole('heading', { level: 1, name: t('all_contacts') });

    expect(document.title).toBe('');
  });
});
