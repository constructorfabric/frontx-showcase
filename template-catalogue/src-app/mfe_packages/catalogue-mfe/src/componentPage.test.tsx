import { fireEvent, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import en from './screens/catalogue/i18n/en.json';
import { KIT_VERSION } from './frame/kitVersion';
import { NARROW_QUERY } from './screens/catalogue/CatalogueLayout';
import { renderCatalogueAt } from './test-support/renderCatalogueAt';

afterEach(() => {
  window.history.replaceState(null, '', '/');
  vi.restoreAllMocks();
});

/** A viewport as narrow as a phone: the navigation's media query matches. */
function phoneViewport() {
  const matchMedia = window.matchMedia;
  vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({ ...matchMedia(query), matches: query === NARROW_QUERY }));
}

describe('component page', () => {
  it('shows the way back, the family, the description, the example, its source and how to use it', async () => {
    renderCatalogueAt('/components/button');
    const page = await screen.findByTestId('catalogue-page');
    expect(await within(page).findByRole('heading', { level: 1, name: 'Button' })).toBeTruthy();
    expect(within(page).getByRole('link', { name: en.back }).getAttribute('href')).toBe('/');
    expect(within(page).getByText(en['family.actions'])).toBeTruthy();
    expect(within(page).getByText(en['description.button'])).toBeTruthy();
    expect(within(page).getByText(`npm install @gears-frontx/ui-kit@${KIT_VERSION}`)).toBeTruthy();
    expect(within(page).getByRole('heading', { level: 2, name: en['contract.title'] })).toBeTruthy();
    expect(within(page).getByTestId('type-definitions').getAttribute('href')).toBe(`https://unpkg.com/@gears-frontx/ui-kit@${KIT_VERSION}/dist/components/button/button.d.ts`);
    // The download carries the example file itself, once its source has loaded.
    const download = await within(page).findByTestId('download-example');
    expect(download.getAttribute('download')).toBe('button.tsx');
    expect(decodeURIComponent(download.getAttribute('href') ?? '')).toContain("from '@gears-frontx/ui-kit'");

    fireEvent.click(within(page).getByRole('tab', { name: en['tab.code'] }));
    expect(await within(page).findByText('examples/button.tsx')).toBeTruthy();
  });

  it("shows the example without the kit demo's measurement readout", async () => {
    renderCatalogueAt('/components/button');
    const page = await screen.findByTestId('catalogue-page');
    expect(await within(page).findByRole('heading', { level: 2, name: 'Sizes' })).toBeTruthy();
    expect(page.textContent).not.toMatch(/\d+x\d+ radius/);
  });
});

describe('catalogue index', () => {
  it('groups the components by family with a count, and filters them by search', async () => {
    renderCatalogueAt('/');
    const page = await screen.findByTestId('catalogue-page');
    const actions = await within(page).findByTestId('family-actions');
    expect(within(actions).getByRole('heading', { level: 2, name: en['family.actions'] })).toBeTruthy();
    expect(within(actions).getAllByRole('link').length).toBeGreaterThan(0);

    fireEvent.change(within(page).getByTestId('index-search'), { target: { value: 'textarea' } });
    expect(within(page).queryByTestId('family-actions')).toBeNull();
    const forms = within(page).getByTestId('family-forms');
    expect(within(forms).getAllByRole('link').map((link) => link.textContent)).toEqual([`Textarea${en.entry_meta}`]);
    expect(within(forms).getByText('1')).toBeTruthy();

    fireEvent.change(within(page).getByTestId('index-search'), { target: { value: 'zzqx' } });
    expect(within(page).getByText(en.no_results)).toBeTruthy();
    expect(within(page).queryAllByTestId(/^family-/)).toEqual([]);
  });
});

describe('navigation on a phone', () => {
  it('replaces the panel with a page select that opens the chosen page', async () => {
    phoneViewport();
    renderCatalogueAt('/');
    const select = await screen.findByTestId('page-select');
    expect(screen.queryByRole('navigation', { name: en.nav_label })).toBeNull();
    expect(screen.getByLabelText(en.page_select)).toBe(select);
    fireEvent.change(select, { target: { value: '/components/button' } });
    expect(await within(await screen.findByTestId('catalogue-page')).findByRole('heading', { level: 1, name: 'Button' })).toBeTruthy();
    // On a component page the select shows the Components section's own option, as the reference does.
    expect(select).toHaveProperty('value', '/');
    fireEvent.change(select, { target: { value: '/foundations/typography' } });
    expect(await within(await screen.findByTestId('catalogue-page')).findByRole('heading', { level: 1, name: en['label.typography'] })).toBeTruthy();
    expect(select).toHaveProperty('value', '/foundations/typography');
  });
});
