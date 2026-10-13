import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popup } from './Popup';

const dispatch = vi.fn();
let stack: Array<{ id: string; title: string; component: string; zIndex: number }> = [];

vi.mock('@gears-frontx/react', async (importOriginal) => ({
  ...(await importOriginal<Record<string, never>>()),
  useAppSelector: (select: (state: Record<string, unknown>) => unknown) => select({ 'layout/popup': { stack } }),
  useAppDispatch: () => dispatch,
  useTranslation: () => ({ t: (key: string) => key }),
}));

const entry = (id: string, title: string) => ({ id, title, component: '', zIndex: 1000 });

function Harness() {
  return (
    <>
      <button type="button">outside</button>
      <Popup>
        <button type="button">first</button>
        <button type="button">second</button>
      </Popup>
    </>
  );
}

describe('Popup', () => {
  beforeEach(() => {
    dispatch.mockReset();
    stack = [];
  });

  it('renders nothing while the popup stack is empty', () => {
    render(<Harness />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('is a modal dialog named by its title, with focus moved inside', async () => {
    stack = [entry('p1', 'Confirm action')];
    render(<Harness />);
    const dialog = await screen.findByRole('dialog', { name: 'Confirm action' });
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
  });

  it('hides the page behind it from assistive technology and moves nothing on it', async () => {
    stack = [entry('p1', 'Confirm action')];
    render(<Harness />);
    await screen.findByRole('dialog');
    // The kit's modal marks everything outside its portal inert; a missing marker means the dialog only claimed to be modal. The Tab wrap itself needs a real browser focus ring and is checked there.
    expect(screen.getByText('outside', { selector: 'button' }).parentElement?.getAttribute('aria-hidden')).toBe('true');
  });

  it('closes the top popup on Escape', async () => {
    stack = [entry('p1', 'Confirm action')];
    const user = userEvent.setup();
    render(<Harness />);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0]?.[0]).toMatchObject({ type: expect.stringContaining('closeTopPopup') });
  });

  it('gets an accessible name from the layout strings when the popup has no title', async () => {
    stack = [entry('p1', '')];
    render(<Harness />);
    expect(await screen.findByRole('dialog', { name: 'layout:popup.untitled' })).toBeTruthy();
  });
});
