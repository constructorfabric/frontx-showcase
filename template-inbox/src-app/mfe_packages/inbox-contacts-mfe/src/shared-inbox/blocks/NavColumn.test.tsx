import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashIcon } from 'lucide-react';
import { NavColumn, type NavColumnItem } from '@inbox-shared/blocks/NavColumn';
import type { SidebarToggle } from '@inbox-shared/ui/useSidebarToggle';
import { expectNoAxeViolations } from './axe';

const items: NavColumnItem[] = [
  { id: 'general', label: 'General', icon: <HashIcon />, count: 4 },
  { id: 'billing', label: 'Billing', icon: <HashIcon />, count: 2 },
];

const column = (overrides: Partial<SidebarToggle> = {}): SidebarToggle => ({
  collapsed: false,
  overlay: false,
  toggle: () => {},
  dismiss: () => {},
  ...overrides,
});

describe('NavColumn', () => {
  it('lists its rows as list items of buttons, the current one marked, and picks a row', async () => {
    const onSelect = vi.fn();
    const { container } = render(
      <NavColumn
        state={column()}
        label="Channels"
        title="Chat"
        items={items}
        selectedId="general"
        onSelect={onSelect}
        closeLabel="Close"
      />
    );
    const nav = screen.getByRole('complementary', { name: 'Channels' });
    expect(nav).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('button', { name: /General/ }).getAttribute('aria-current')).toBe('true');
    expect(screen.getByRole('button', { name: /Billing/ }).getAttribute('aria-current')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: /Billing/ }));
    expect(onSelect).toHaveBeenCalledWith('billing');
    // The kit's ItemGroup is a list: axe's aria-required-children holds it to list items.
    await expectNoAxeViolations(container);
  });

  it('takes a folded column out of the tab order and away from assistive technology', () => {
    render(
      <NavColumn
        state={column({ collapsed: true })}
        label="Channels"
        title="Chat"
        items={items}
        selectedId="general"
        onSelect={() => {}}
        closeLabel="Close"
      />
    );
    const aside = document.querySelector('aside');
    expect(aside?.getAttribute('aria-hidden')).toBe('true');
    expect(aside?.hasAttribute('inert')).toBe(true);
  });

  it('opens as a sheet below the inline-column width, named by its title, and closes on its close button', async () => {
    const dismiss = vi.fn();
    render(
      <NavColumn
        state={column({ overlay: true, dismiss })}
        label="Channels"
        title="Chat"
        items={items}
        selectedId="general"
        onSelect={() => {}}
        closeLabel="Close"
      />
    );
    expect(await screen.findByRole('dialog', { name: 'Chat' })).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(dismiss).toHaveBeenCalled();
  });
});
