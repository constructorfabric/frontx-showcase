import { render, screen, within } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { CardTiles } from './CardTiles';

const items = [
  { eyebrow: 'Library', title: 'Routing', text: 'Screens and routes.', link: createElement('a', { href: '/routing' }) },
  { title: 'MFE runtime', text: 'Loading and host communication.', link: createElement('a', { href: '/mfes' }) },
];

describe('CardTiles', () => {
  it('renders a list of whole-card links with h3 titles', () => {
    render(<CardTiles items={items} />);
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(2);
    const routing = screen.getByRole('link', { name: /Routing/ });
    expect(routing.getAttribute('href')).toBe('/routing');
    expect(within(routing).getByRole('heading', { level: 3, name: 'Routing' })).toBeTruthy();
    expect(within(routing).getByText('Library')).toBeTruthy();
  });

  it('passes axe', async () => {
    const { container } = render(<CardTiles items={items} />);
    await expectNoAxeViolations(container);
  });
});
