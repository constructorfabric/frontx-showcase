import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavGroup, NavLink, NavMenu } from './NavMenu';

function Demos({ closeKey, onOpen = vi.fn() }: { closeKey: string; onOpen?: () => void }) {
  return (
    <>
      <NavMenu label="Site sections">
        <NavGroup label="Demos" active={false} closeKey={closeKey} data-testid="group">
          <li>
            <NavLink href="/?screen=mail" active={false} label="Mail" grouped onClick={(event) => (event.preventDefault(), onOpen())} />
          </li>
          <li>
            <NavLink href="/?screen=chat" active={false} label="Chat" grouped onClick={(event) => event.preventDefault()} />
          </li>
        </NavGroup>
      </NavMenu>
      <p>outside</p>
    </>
  );
}

const trigger = () => screen.getByTestId('group');
const isOpen = () => trigger().getAttribute('aria-expanded') === 'true';

describe('NavGroup', () => {
  it('closes after a choice', async () => {
    const onOpen = vi.fn();
    render(<Demos closeKey="home" onOpen={onOpen} />);
    await userEvent.click(trigger());
    expect(isOpen()).toBe(true);
    await userEvent.click(screen.getByRole('link', { name: 'Mail' }));
    expect(onOpen).toHaveBeenCalled();
    expect(isOpen()).toBe(false);
  });

  it('closes on Escape and gives focus back to its button', async () => {
    render(<Demos closeKey="home" />);
    trigger().focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(isOpen()).toBe(true);
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Mail' }));
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Chat' }));
    await userEvent.keyboard('{Escape}');
    expect(isOpen()).toBe(false);
    expect(document.activeElement).toBe(trigger());
  });

  it('closes on a press outside and when the screen changes', async () => {
    const { rerender } = render(<Demos closeKey="home" />);
    await userEvent.click(trigger());
    fireEvent.pointerDown(screen.getByText('outside'));
    expect(isOpen()).toBe(false);

    await userEvent.click(trigger());
    expect(isOpen()).toBe(true);
    rerender(<Demos closeKey="docs" />);
    expect(isOpen()).toBe(false);
  });
});
