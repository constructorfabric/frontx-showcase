import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { ActionRow } from './ActionRow';

const actions = [createElement('a', { key: 'source', href: '/source' }, 'Explore source'), createElement('a', { key: 'kit', href: '/kit' }, 'UI Kit integration')];

describe('ActionRow', () => {
  it('holds every action as a direct child of one row, in the given order, each still a link', () => {
    const { container } = render(<ActionRow>{actions}</ActionRow>);
    const row = container.firstElementChild as HTMLElement;
    expect([...row.children].map((child) => child.textContent)).toEqual(['Explore source', 'UI Kit integration']);
    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual(['/source', '/kit']);
    expect(row.className).not.toBe('');
  });

  it('passes axe', async () => {
    const { container } = render(<ActionRow>{actions}</ActionRow>);
    await expectNoAxeViolations(container);
  });
});
