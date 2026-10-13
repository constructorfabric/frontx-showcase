import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Menu } from './Menu';
import type { NavEntry } from './navigation';

vi.mock('@gears-frontx/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@gears-frontx/react')>()),
  useTranslation: () => ({ t: (key: string) => (key === 'layout:nav.groups.demos' ? 'Demos' : key) }),
}));

// Shaped like a real registry id, dots and tildes included, so the test id assertion shows the id goes in verbatim.
const tasksId = 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.demo.screens.tasks.v1';

const entries: NavEntry[] = [
  { kind: 'screen', id: tasksId, token: 'tasks', label: 'Tasks', order: 10, href: './?screen=tasks', active: true },
  { kind: 'screen', id: 'ext.docs', token: 'docs', label: 'Docs', order: 40, href: './?screen=docs', active: false },
  { kind: 'group', id: 'demos', order: 60, active: false, items: [{ kind: 'screen', id: 'ext.mail', token: 'mail', label: 'Mail', order: 60, href: './?screen=mail', active: false }] },
];

describe('Menu', () => {
  it('renders every top-level screen as a link to its canonical address, the mounted one marked current', () => {
    render(<Menu entries={entries} onOpen={vi.fn()} />);
    const tasks = screen.getByTestId(`menu-item-${tasksId}`);
    expect(tasks.tagName).toBe('A');
    expect(tasks.getAttribute('href')).toBe('./?screen=tasks');
    expect(tasks.getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Docs' }).getAttribute('aria-current')).toBeNull();
  });

  it('opens a screen through the callback on a plain click and leaves a modified click to the browser', () => {
    const onOpen = vi.fn();
    render(<Menu entries={entries} onOpen={onOpen} />);
    const docs = screen.getByRole('link', { name: 'Docs' });

    fireEvent.click(docs);
    expect(onOpen).toHaveBeenCalledWith('ext.docs');

    onOpen.mockClear();
    // jsdom cannot follow a link; the window listener runs after the menu's own handler and only stops the navigation the browser would make.
    const stopNavigation = (event: Event) => event.preventDefault();
    window.addEventListener('click', stopNavigation);
    fireEvent.click(docs, { metaKey: true });
    window.removeEventListener('click', stopNavigation);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('names a group from the layout strings', () => {
    render(<Menu entries={entries} onOpen={vi.fn()} />);
    expect(screen.getByTestId('menu-group-demos').textContent).toContain('Demos');
  });

  it('renders an empty labelled navigation while the screens are not known yet', () => {
    render(<Menu entries={undefined} onOpen={vi.fn()} />);
    expect(screen.getByRole('navigation').querySelectorAll('a')).toHaveLength(0);
  });
});
