import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../../test-support/axe';
import ListCardShowcase from './ListCard.showcase';

describe('ListCard', () => {
  it('names the card by its heading, counts its rows and makes each row one link', async () => {
    const { container } = render(<ListCardShowcase />);
    const card = screen.getByRole('region', { name: 'Actions' });
    expect(within(card).getByRole('heading', { level: 2, name: 'Actions' })).toBeTruthy();
    expect(within(card).getByText('2')).toBeTruthy();
    expect(within(card).getAllByRole('link').map((link) => link.textContent)).toEqual(['ButtonPreview & code', 'ToggleA two-state button.Preview & code']);
    await expectNoAxeViolations(container);
  });
});
