import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../../test-support/axe';
import ListCardGridShowcase from './ListCardGrid.showcase';

describe('ListCardGrid', () => {
  it('groups the cards under one name', async () => {
    const { container } = render(<ListCardGridShowcase />);
    const group = screen.getByRole('group', { name: 'Components by family' });
    expect(within(group).getAllByRole('region').map((card) => card.getAttribute('aria-label'))).toEqual(['Actions', 'Forms']);
    await expectNoAxeViolations(container);
  });
});
