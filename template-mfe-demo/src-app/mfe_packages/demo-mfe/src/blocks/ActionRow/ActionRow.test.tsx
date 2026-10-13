import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { ActionRow } from './ActionRow';
import ActionRowShowcase from './ActionRow.showcase';

describe('ActionRow', () => {
  it('lays its actions out in order inside one element', () => {
    const { container } = render(
      <ActionRow>
        <button type="button">Save</button>
        <button type="button">Cancel</button>
      </ActionRow>,
    );
    expect(container.childElementCount).toBe(1);
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['Save', 'Cancel']);
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <ActionRowShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
