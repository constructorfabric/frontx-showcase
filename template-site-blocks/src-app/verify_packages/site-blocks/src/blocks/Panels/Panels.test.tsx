import { render, screen, within } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { Panels } from './Panels';

const items = [
  { title: 'Understand the templates', text: 'Browse selected source files.', actions: createElement('a', { href: '/templates' }, 'Explore templates') },
  { label: 'packages/ui-kit', title: 'Work with an agent', text: 'Use a focused task.', actions: [createElement('a', { key: 'a', href: '/task' }, 'Get the task'), createElement('a', { key: 'b', href: '/kit' }, 'AI Kit documentation')] },
  { title: 'Read the source', text: 'Every package is open.' },
];

describe('Panels', () => {
  it('renders one panel per item with an h3, its text and its actions', () => {
    render(<Panels items={items} />);
    const panels = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(panels).toHaveLength(3);
    expect(within(panels[0]!).getByRole('heading', { level: 3, name: 'Understand the templates' })).toBeTruthy();
    expect(within(panels[1]!).getAllByRole('link')).toHaveLength(2);
    expect(within(panels[1]!).getByText('packages/ui-kit')).toBeTruthy();
    expect(within(panels[2]!).queryAllByRole('link')).toHaveLength(0);
  });

  it('passes axe', async () => {
    const { container } = render(<Panels items={items} />);
    await expectNoAxeViolations(container);
  });
});
