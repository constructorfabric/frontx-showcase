import { render, screen, within } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { StartPaths } from './StartPaths';

const items = [
  { title: 'Start a new app', text: 'Run Shell + MFE, then change your first screen.', link: createElement('a', { href: '/get-started' }), current: true },
  { title: 'Use in an existing app', text: 'Choose a library without adopting the full structure.', link: createElement('a', { href: '/libraries' }) },
];

describe('StartPaths', () => {
  it('renders a named navigation landmark with one link per starting point', () => {
    render(<StartPaths label="Ways to start" items={items} />);
    const nav = screen.getByRole('navigation', { name: 'Ways to start' });
    expect(within(nav).getAllByRole('listitem')).toHaveLength(2);
    expect(within(nav).getByRole('link', { name: /Use in an existing app/ }).getAttribute('href')).toBe('/libraries');
  });

  it('marks only the reader\'s current path', () => {
    render(<StartPaths label="Ways to start" items={items} />);
    expect(screen.getByRole('link', { name: /Start a new app/ }).getAttribute('aria-current')).toBe('true');
    expect(screen.getByRole('link', { name: /Use in an existing app/ }).hasAttribute('aria-current')).toBe(false);
  });

  it('passes axe', async () => {
    const { container } = render(<StartPaths label="Ways to start" items={items} />);
    await expectNoAxeViolations(container);
  });
});
