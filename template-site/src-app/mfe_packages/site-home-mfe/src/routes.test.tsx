import { render, screen } from '@testing-library/react';
import { FRONTX_SHARED_PROPERTY_LANGUAGE } from '@gears-frontx/react';
import { resolveNavigationHistory } from '@gears-frontx/routing';
import { adaptProviderHistory, EngineProvider } from '@gears-frontx/routing-tanstack';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMfeBridgeFixture } from '@frontx-test-utils/createMfeBridgeFixture';
import en from './screens/home/i18n/en.json';
import { homeRouteTree } from './routes';
import { ScreenFrame } from './shared/ScreenFrame';

/** Renders the route tree at a page address, as a standalone mount reads it. */
function renderAt(pathname: string) {
  window.history.replaceState(null, '', pathname);
  const { bridge } = createMfeBridgeFixture({
    extDomainId: 'gts.frontx.mfes.ext.domain.v1~frontx.screensets.layout.screen.v1',
    extensionId: 'ext.home',
    initialProperties: { [FRONTX_SHARED_PROPERTY_LANGUAGE]: 'en' },
  });
  const history = adaptProviderHistory(resolveNavigationHistory(), undefined);
  return render(
    <ScreenFrame bridge={bridge} languages={['en']}>
      <EngineProvider routeTree={homeRouteTree} history={history} />
    </ScreenFrame>
  );
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('[]')));
  // The router restores scroll on navigation; jsdom does not implement scrolling.
  vi.stubGlobal('scrollTo', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState(null, '', '/');
});

describe('homeRouteTree', () => {
  it('renders the home page at the screen root', async () => {
    renderAt('/');
    expect(await screen.findByRole('heading', { level: 1, name: en['hero.title'] })).toBeTruthy();
  });

  it("renders the screen's own not-found page for any other path", async () => {
    renderAt('/nowhere');
    expect(await screen.findByRole('heading', { level: 1, name: en.not_found_title })).toBeTruthy();
    // An in-screen link: standalone it names the screen's root path; composed, routing-tanstack writes the screen's full address.
    expect(screen.getByRole('link', { name: en.not_found_link }).getAttribute('href')).toBe('/');
  });
});
