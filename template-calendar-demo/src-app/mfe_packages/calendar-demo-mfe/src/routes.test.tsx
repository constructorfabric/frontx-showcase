import './test-support/jsdomBrowserApis';
import { render, screen } from '@testing-library/react';
import { FRONTX_SHARED_PROPERTY_LANGUAGE, FRONTX_SHARED_PROPERTY_THEME } from '@gears-frontx/react';
import { resolveNavigationHistory } from '@gears-frontx/routing';
import { adaptProviderHistory, EngineProvider } from '@gears-frontx/routing-tanstack';
import { createMfeBridgeFixture } from '@frontx-test-utils/createMfeBridgeFixture';
import { afterEach, describe, expect, it } from 'vitest';
import en from './screens/calendar/i18n/en.json';
import { calendarRouteTree } from './routes';
import { ScreenFrame } from './shared/ScreenFrame';

/** Renders the route tree at a path, over the page address (the standalone mode of the screen's router). */
function renderCalendarAt(pathname: string) {
  window.history.replaceState(null, '', pathname);
  const { bridge } = createMfeBridgeFixture({
    extDomainId: 'gts.frontx.mfes.ext.domain.v1~frontx.screensets.layout.screen.v1',
    extensionId: 'ext.calendar',
    initialProperties: { [FRONTX_SHARED_PROPERTY_LANGUAGE]: 'en', [FRONTX_SHARED_PROPERTY_THEME]: 'light' },
  });
  return render(
    <ScreenFrame bridge={bridge}>
      <EngineProvider routeTree={calendarRouteTree} history={adaptProviderHistory(resolveNavigationHistory(), undefined)} />
    </ScreenFrame>
  );
}

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('calendarRouteTree', () => {
  it('renders the placeholder at the screen root, its title the one level-one heading', async () => {
    renderCalendarAt('/');
    const page = await screen.findByTestId('calendar-page');
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings.map((heading) => heading.textContent)).toEqual([en.placeholder_title]);
    expect(page.textContent).toContain(en.placeholder_body);
  });

  // The demo's former pages are gone; their addresses get the not-found page, not the placeholder.
  it("renders the screen's own not-found page for any other path, linking back to the root", async () => {
    renderCalendarAt('/week');
    expect(await screen.findByRole('heading', { level: 1, name: en.not_found_title })).toBeTruthy();
    expect(screen.queryByTestId('calendar-page')).toBeNull();
    expect(screen.getByRole('link', { name: en.not_found_link }).getAttribute('href')).toBe('/');
  });
});
