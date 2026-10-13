import { render, screen, within } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { PathCards } from './PathCards';

const items = [
  { title: 'Run Shell + MFE', text: 'Create the host and run it.', link: createElement('a', { href: '/start' }), figure: createElement('svg', { 'data-testid': 'figure-1' }) },
  { eyebrow: 'Guide', title: 'Make your first change', text: 'Change a title and rebuild.', link: createElement('a', { href: '/first-change' }) },
  { title: 'Use UI Kit in your app', text: 'Find component contracts.', link: createElement('a', { href: '/kit' }) },
];

describe('PathCards', () => {
  it('renders one list item per path, each a single link that holds an h2', () => {
    const { container } = render(<PathCards items={items} />);
    const list = screen.getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    const link = screen.getByRole('link', { name: /Run Shell \+ MFE/ });
    expect(link.getAttribute('href')).toBe('/start');
    expect(within(link).getByRole('heading', { level: 2, name: 'Run Shell + MFE' })).toBeTruthy();
    expect(container.querySelectorAll('a a')).toHaveLength(0);
  });

  it('puts the figure in a decorative slot and shows the eyebrow only where given', () => {
    render(<PathCards items={items} />);
    expect(screen.getByTestId('figure-1').closest('[aria-hidden="true"]')).toBeTruthy();
    expect(screen.getByText('Guide')).toBeTruthy();
    expect(screen.getAllByRole('link')[0]?.textContent).not.toContain('Guide');
  });

  it('passes axe', async () => {
    const { container } = render(<PathCards items={items} />);
    await expectNoAxeViolations(container);
  });
});
