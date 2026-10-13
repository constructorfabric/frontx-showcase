import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../../test-support/axe';
import IndexIntroShowcase from './IndexIntro.showcase';

describe('IndexIntro', () => {
  it('shows the sentence and the search field', async () => {
    const { container } = render(<IndexIntroShowcase />);
    expect(screen.getByText(/Controls, patterns/).tagName).toBe('P');
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeTruthy();
    await expectNoAxeViolations(container);
  });
});
