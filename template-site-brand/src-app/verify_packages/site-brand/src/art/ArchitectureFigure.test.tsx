import { render, within } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../test-support/axe';
import { ArchitectureFigure } from './ArchitectureFigure';

const a = (href: string) => createElement('a', { href });

const props = {
  label: 'The App Shell contains independent screens. Both can reuse the optional UI Kit. Design Guardrails guide development.',
  kit: { note: 'Optional', title: 'UI Kit', link: a('/kit') },
  rules: { note: 'While you build', title: 'Design\nGuardrails', link: a('/guardrails') },
  shell: { title: 'App Shell', link: a('/shell'), templates: { label: 'Screen templates', link: a('/screens') } },
  screens: [
    { title: 'Screen A', hint: 'explore screen templates', link: a('/screens') },
    { title: 'Screen B', link: a('/screens') },
  ],
  wires: { kit: 'Shared components', rules: 'Shared rules' },
} as const;

describe('ArchitectureFigure', () => {
  it('is a figure named by its label, a light island', () => {
    const { getByRole } = render(<ArchitectureFigure {...props} />);
    const figure = getByRole('figure', { name: props.label });
    expect(figure.getAttribute('data-theme')).toBe('light');
  });

  it('makes every block a link with its own text and destination, and names a screen link with its hint', () => {
    const { getByRole } = render(<ArchitectureFigure {...props} />);
    const figure = getByRole('figure');
    const links = within(figure).getAllByRole('link');
    expect(links.map((link) => [link.getAttribute('href'), link.textContent?.trim()])).toEqual([
      ['/shell', 'App Shell'],
      ['/screens', 'Screen templates'],
      ['/kit', 'UI Kit'],
      ['/guardrails', 'Design\nGuardrails'],
      ['/screens', 'Screen A'],
      ['/screens', 'Screen B'],
    ]);
    expect(within(figure).getByRole('link', { name: 'Screen A: explore screen templates' })).toBeTruthy();
    expect(within(figure).getByRole('link', { name: 'Screen B' })).toBeTruthy();
  });

  it('shows the notes and the wire labels as text, and hides the wires and patterns', () => {
    const { container, getByText } = render(<ArchitectureFigure {...props} />);
    for (const text of ['Optional', 'While you build', 'Shared components', 'Shared rules']) expect(getByText(text)).toBeTruthy();
    const wires = [...container.querySelectorAll('svg')].filter((svg) => svg.querySelector('circle'));
    expect(wires).toHaveLength(2);
    for (const svg of container.querySelectorAll('svg')) expect(svg.getAttribute('aria-hidden')).toBe('true');
  });

  it('passes axe', async () => {
    const { container } = render(<ArchitectureFigure {...props} />);
    await expectNoAxeViolations(container);
  });
});
