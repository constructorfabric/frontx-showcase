import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../../test-support/axe';
import PagePlaceholderShowcase from './PagePlaceholder.showcase';

describe('PagePlaceholder', () => {
  it('names what is loading', async () => {
    const { container } = render(<PagePlaceholderShowcase />);
    expect(screen.getByRole('status', { name: 'Loading the page' })).toBeTruthy();
    await expectNoAxeViolations(container);
  });
});
