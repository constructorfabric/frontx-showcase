import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { Header } from './Header';
import { buildNavigation as buildNavigationWith, type NavigableScreen } from './navigation';

const strings: Record<string, string> = {
  'layout:brandHome': 'Accueil',
  'layout:brandCompany': 'Constructor Fabric',
  'layout:brand': 'FrontX',
  'layout:brandBadge': 'Gear',
  'layout:controls.language': 'Language',
};

vi.mock('@gears-frontx/react', async (importOriginal) => ({
  ...(await importOriginal<Record<string, never>>()),
  useTranslation: () => ({ t: (key: string) => strings[key] ?? key, language: 'en', setLanguage: vi.fn() }),
}));
const menuEntries = vi.hoisted(() => ({ last: undefined as unknown }));
vi.mock('./Menu', () => ({
  Menu: ({ entries }: { entries: unknown }) => {
    menuEntries.last = entries;
    return null;
  },
}));
vi.mock('./site', async (importOriginal) => ({ ...(await importOriginal<Record<string, never>>()), SITE_LANGUAGES: ['en'], HEADER_HIDDEN_GROUPS: ['demos'] }));

const groupId = (name: string) => `gts.frontx.screensets.layout.nav_group.v1~fixture.site.layout.${name}.v1`;
const GROUPS: ReadonlyMap<string, string> = new Map([[groupId('demos'), 'demos']]);
/** A screen extension; one with a group names the group's instance id, as its package declares it. */
const screenOf = (name: string, route: string, order: number, group?: string): NavigableScreen => ({ id: name, route, presentation: { label: name, order, ...(group ? { group: groupId(group) } : {}) } });
const buildNavigation = (screens: readonly NavigableScreen[], domainKey: string, activeId: string | undefined) => buildNavigationWith(screens, domainKey, activeId, GROUPS);

describe('Header', () => {
  it('leads with the Constructor Fabric lockup and offers no theme or language choice', () => {
    render(<Header entries={[]} onOpen={vi.fn()} />);
    const brand = screen.getByRole('link', { name: 'Accueil' });
    expect(brand.textContent).toBe('Constructor Fabric/FrontX');
    // The badge follows the link outside it, so its small label is not interactive text.
    expect(brand.nextElementSibling?.textContent).toBe('Gear');
    // The logo is the brand template's asset, imported as a module, not a file in the shell's public folder.
    expect(brand.querySelector('img')?.getAttribute('src')).toMatch(/site-brand\/src\/assets\/constructor-weave\.svg$/);
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('passes axe', async () => {
    const { container } = render(<Header entries={[]} onOpen={vi.fn()} />);
    const result = await axe.run(container, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, rules: { 'color-contrast': { enabled: false } } });
    expect(result.violations.map((violation) => violation.id)).toEqual([]);
  });

  it('opens the configured home screen from the brand, whatever its order', async () => {
    const onOpen = vi.fn();
    const entries = buildNavigation([screenOf('ext.about', '/about', 1), screenOf('ext.home', '/home', 10)], 'screen', undefined);
    render(<Header entries={entries} onOpen={onOpen} />);
    const brand = screen.getByRole('link', { name: 'Accueil' });
    expect(brand.getAttribute('href')).toBe('./?screen=home');
    await userEvent.click(brand);
    expect(onOpen).toHaveBeenCalledWith('ext.home');
  });

  it('hands the menu every entry except the groups the site config hides', () => {
    const entries = buildNavigation([screenOf('ext.home', '/home', 10), screenOf('ext.mail', '/mail', 61, 'demos'), screenOf('ext.libs', '/libs', 35)], 'screen', undefined);
    render(<Header entries={entries} onOpen={vi.fn()} />);
    expect((menuEntries.last as { id: string }[]).map((entry) => entry.id)).toEqual(['ext.home', 'ext.libs']);
  });
});
