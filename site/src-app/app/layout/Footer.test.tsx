import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import type { FooterState } from '@gears-frontx/react';
import { Footer, SOURCE_LINKS } from './Footer';
import type { NavEntry } from './navigation';

let mockFooterState: FooterState | undefined;

vi.mock('@gears-frontx/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@gears-frontx/react')>()),
  useAppSelector: () => mockFooterState,
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('./site', () => ({ FOOTER_SCREENS: ['docs', 'missing'], INK_FOOTER_SCREENS: ['mail'] }));

const entries: NavEntry[] = [
  { kind: 'screen', id: 'ext.home', token: 'home', label: 'Home', order: 10, href: './?screen=home', active: true },
  { kind: 'screen', id: 'ext.docs', token: 'docs', label: 'Docs', order: 40, href: './?screen=docs', active: false },
  { kind: 'group', id: 'demos', order: 60, active: false, items: [{ kind: 'screen', id: 'ext.mail', token: 'mail', label: 'Mail', order: 60, href: './?screen=mail', active: false }] },
];

describe('Footer', () => {
  it('lists the source repositories and only the screens site.config.json names for the footer', () => {
    mockFooterState = undefined;
    render(<Footer entries={entries} onOpen={vi.fn()} />);
    expect(screen.getByRole('contentinfo')).toBeTruthy();
    const [brand, ...links] = screen.getAllByRole('link');
    expect(brand.textContent).toBe('layout:brandCompany/layout:brand');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([...SOURCE_LINKS.map((link) => link.href), './?screen=docs']);
    expect(links[0].textContent).toBe(`layout:${SOURCE_LINKS[0].key}: layout:${SOURCE_LINKS[0].detailKey}`);
  });

  it('opens a section, and the home screen from the lockup, through the callback on a plain click', () => {
    mockFooterState = { visible: true };
    const onOpen = vi.fn();
    render(<Footer entries={entries} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole('link', { name: 'Docs' }));
    fireEvent.click(screen.getByRole('link', { name: 'layout:brandHome' }));
    expect(onOpen.mock.calls).toEqual([['ext.docs'], ['ext.home']]);
  });

  it('takes the ink variant only while a screen site.config.json names for it is mounted, screens inside a group included', () => {
    mockFooterState = undefined;
    const { rerender } = render(<Footer entries={entries} onOpen={vi.fn()} />);
    expect(screen.getByRole('contentinfo').getAttribute('data-variant')).toBeNull();
    const mailMounted: NavEntry[] = [
      { ...entries[0], active: false } as NavEntry,
      entries[1],
      { kind: 'group', id: 'demos', order: 60, active: true, items: [{ kind: 'screen', id: 'ext.mail', token: 'mail', label: 'Mail', order: 60, href: './?screen=mail', active: true }] },
    ];
    rerender(<Footer entries={mailMounted} onOpen={vi.fn()} />);
    expect(screen.getByRole('contentinfo').getAttribute('data-variant')).toBe('ink');
  });

  it('keeps a source link in the same tab and passes axe', async () => {
    mockFooterState = undefined;
    const { container } = render(<Footer entries={entries} onOpen={vi.fn()} />);
    const source = screen.getAllByRole('link')[1];
    expect(source.getAttribute('target')).not.toBe('_blank');
    expect(source.getAttribute('rel')).toBe('noopener');
    const result = await axe.run(container, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, rules: { 'color-contrast': { enabled: false } } });
    expect(result.violations.map((violation) => violation.id)).toEqual([]);
  });

  it('renders nothing when the layout state hides it', () => {
    mockFooterState = { visible: false };
    const { container } = render(<Footer entries={entries} onOpen={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});
