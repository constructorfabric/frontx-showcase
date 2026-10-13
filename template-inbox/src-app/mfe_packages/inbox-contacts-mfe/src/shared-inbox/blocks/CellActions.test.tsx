import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EyeIcon } from 'lucide-react';
import { Button } from '@gears-frontx/ui-kit';
import { CellActions } from '@inbox-shared/blocks/CellActions';
import { expectNoAxeViolations } from './axe';

describe('CellActions', () => {
  it('holds the row actions, which stay operable', async () => {
    const onView = vi.fn();
    const { container } = render(
      <CellActions>
        <Button variant="ghost" size="sm" icon={<EyeIcon />} aria-label="View contact" onClick={onView} />
      </CellActions>
    );
    await userEvent.click(screen.getByRole('button', { name: 'View contact' }));
    expect(onView).toHaveBeenCalledTimes(1);
    await expectNoAxeViolations(container);
  });
});
