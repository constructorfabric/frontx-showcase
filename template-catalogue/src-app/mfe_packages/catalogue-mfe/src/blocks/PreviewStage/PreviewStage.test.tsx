import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../../test-support/axe';
import PreviewStageShowcase from './PreviewStage.showcase';

describe('PreviewStage', () => {
  it('shows the example inside the kit card', async () => {
    const { container } = render(<PreviewStageShowcase />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
    await expectNoAxeViolations(container);
  });
});
