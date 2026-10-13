import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../../test-support/axe';
import PageHeaderShowcase from './PageHeader.showcase';

describe('PageHeader', () => {
  it('draws the trail, the one h1 and the lead', async () => {
    const { container } = render(<PageHeaderShowcase />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'UI Kit' }).getAttribute('href')).toBe('#index');
    expect(screen.getAllByRole('heading', { level: 1 }).map((heading) => heading.textContent)).toEqual(['Button']);
    expect(screen.getByText(/Triggers an action/).tagName).toBe('P');
    await expectNoAxeViolations(container);
  });
});
