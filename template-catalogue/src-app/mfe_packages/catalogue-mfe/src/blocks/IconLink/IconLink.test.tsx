import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../../test-support/axe';
import IconLinkShowcase from './IconLink.showcase';

describe('IconLink', () => {
  it('names each link by its text alone', async () => {
    const { container } = render(<IconLinkShowcase />);
    expect(screen.getByRole('link', { name: 'All components' }).getAttribute('href')).toBe('#index');
    expect(screen.getByTestId('showcase-types').textContent).toBe('Type definitions');
    await expectNoAxeViolations(container);
  });
});
