import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../../test-support/axe';
import CodeSampleShowcase from './CodeSample.showcase';

afterEach(() => vi.restoreAllMocks());

describe('CodeSample', () => {
  it('shows the code under its caption and copies the whole text', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const { container } = render(<CodeSampleShowcase />);
    expect(screen.getByText('Install')).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Install' }).textContent).toBe('npm install @gears-frontx/ui-kit@0.4.0');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    });
    expect(writeText).toHaveBeenCalledWith('npm install @gears-frontx/ui-kit@0.4.0');
    expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy();
    await expectNoAxeViolations(container);
  });
});
