import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../../test-support/axe';
import ComponentGuideShowcase from './ComponentGuide.showcase';

describe('ComponentGuide', () => {
  it('names each column by its heading', async () => {
    const { container } = render(<ComponentGuideShowcase />);
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Use in your app', 'Component contract']);
    expect(screen.getByRole('region', { name: 'Component contract' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Type definitions' }).getAttribute('href')).toBe('#types');
    await expectNoAxeViolations(container);
  });
});
