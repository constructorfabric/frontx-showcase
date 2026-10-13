import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../../test-support/axe';
import CatalogueFrameShowcase from './CatalogueFrame.showcase';

describe('CatalogueFrame', () => {
  it('places the section bar, the panel and the page, with no main landmark of its own', async () => {
    const { container } = render(<CatalogueFrameShowcase />);
    expect(screen.getByRole('navigation', { name: 'Sections' })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Pages' })).toBeTruthy();
    expect(screen.getByTestId('catalogue-page').textContent).toBe('The current page.');
    expect(container.querySelector('main')).toBeNull();
    await expectNoAxeViolations(container);
  });
});
