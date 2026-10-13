import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../../test-support/axe';
import FoundationStageShowcase from './FoundationStage.showcase';

describe('FoundationStage', () => {
  it('shows the foundation page in the stage', async () => {
    const { container } = render(<FoundationStageShowcase />);
    expect(screen.getByRole('table', { name: 'Spacing tokens' })).toBeTruthy();
    await expectNoAxeViolations(container);
  });
});
