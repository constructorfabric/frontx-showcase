import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Layout } from './Layout';

const navigation = { entries: [], open: vi.fn() };

vi.mock('@gears-frontx/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@gears-frontx/react')>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('./useScreenNavigation', () => ({ useScreenNavigation: () => navigation }));

// Every slot Layout composes is stubbed, so what the assertions see is Layout's own JSX.
// The header stub carries a link, so the keyboard test sees the skip link come before the header's own stops.
vi.mock('./Header', () => ({
  Header: (props: { entries: unknown }) => (
    <div data-testid="header" data-shared={props.entries === navigation.entries ? 'yes' : 'no'}>
      <a href="/">header link</a>
    </div>
  ),
}));
vi.mock('./Footer', () => ({ Footer: (props: { entries: unknown }) => <div data-testid="footer" data-shared={props.entries === navigation.entries ? 'yes' : 'no'} /> }));
vi.mock('./Sidebar', () => ({ Sidebar: () => <div data-testid="sidebar" /> }));
vi.mock('./Popup', () => ({ Popup: () => <div data-testid="popup" /> }));
vi.mock('./Overlay', () => ({ Overlay: () => <div data-testid="overlay" /> }));

describe('Layout', () => {
  it('frames the screen children in the main landmark between the header and the footer', () => {
    render(<Layout>screen content</Layout>);
    expect(screen.getByRole('main').textContent).toBe('screen content');
    expect(screen.getByTestId('header')).toBeTruthy();
    expect(screen.getByTestId('footer')).toBeTruthy();
  });

  it('gives the header and the footer the same navigation entries', () => {
    render(<Layout>x</Layout>);
    expect(screen.getByTestId('header').dataset.shared).toBe('yes');
    expect(screen.getByTestId('footer').dataset.shared).toBe('yes');
  });

  it('opens with a skip link that moves keyboard focus to the main landmark', async () => {
    const user = userEvent.setup();
    render(<Layout>screen content</Layout>);
    await user.tab();
    const skip = screen.getByRole('link', { name: 'layout:skipToContent' });
    expect(document.activeElement).toBe(skip);
    await user.keyboard('{Enter}');
    expect(document.activeElement).toBe(screen.getByRole('main'));
    expect(window.location.hash).toBe('');
  });
});
