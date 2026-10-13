import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@gears-frontx/ui-kit';
import { ChipRow } from '@inbox-shared/blocks/ChipRow';
import { expectNoAxeViolations } from './axe';

describe('ChipRow', () => {
  it('lays its chips out in one row', async () => {
    const { container } = render(
      <ChipRow>
        <Badge variant="secondary">vip</Badge>
        <Badge variant="secondary">billing</Badge>
      </ChipRow>
    );
    expect(screen.getByText('vip').parentElement).toBe(screen.getByText('billing').parentElement);
    await expectNoAxeViolations(container);
  });
});
