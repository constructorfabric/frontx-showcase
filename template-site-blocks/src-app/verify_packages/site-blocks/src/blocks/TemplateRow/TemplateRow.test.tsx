import { render, screen, within } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { TemplateRow } from './TemplateRow';

const item = { title: 'Add Design Guardrails', text: 'Design rules, agent guidance and interface checks.', link: createElement('a', { href: '/guardrails' }), figure: createElement('svg', { 'data-testid': 'figure' }) };

describe('TemplateRow', () => {
  it('renders one whole-card link holding an h2 and its text', () => {
    render(<TemplateRow item={item} />);
    const link = screen.getByRole('link', { name: /Add Design Guardrails/ });
    expect(link.getAttribute('href')).toBe('/guardrails');
    expect(within(link).getByRole('heading', { level: 2, name: 'Add Design Guardrails' })).toBeTruthy();
    expect(within(link).getByText(/interface checks/)).toBeTruthy();
    expect(screen.getByTestId('figure').closest('[aria-hidden="true"]')).toBeTruthy();
  });

  it('closes the row with a decorative arrow after the copy', () => {
    render(<TemplateRow item={item} />);
    const link = screen.getByRole('link', { name: /Add Design Guardrails/ });
    const arrow = link.lastElementChild;
    expect(arrow?.matches('svg.lucide-arrow-up-right')).toBe(true);
    expect(arrow?.getAttribute('aria-hidden')).toBe('true');
  });

  it('passes axe', async () => {
    const { container } = render(<TemplateRow item={item} />);
    await expectNoAxeViolations(container);
  });
});
