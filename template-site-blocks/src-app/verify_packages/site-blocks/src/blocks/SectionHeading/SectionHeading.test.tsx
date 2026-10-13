import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { SectionHeading } from './SectionHeading';
import SectionHeadingShowcase from './SectionHeading.showcase';

describe('SectionHeading', () => {
  it('renders a level-two heading that a jump can focus', () => {
    render(<SectionHeading id="tools" title="Source & tools" />);
    const heading = screen.getByRole('heading', { level: 2, name: 'Source & tools' });
    expect(heading.id).toBe('tools');
    expect(heading.getAttribute('tabindex')).toBe('-1');
  });

  it('steps the title down one role when a label names the group', () => {
    const { container } = render(
      <>
        <SectionHeading id="a" title="Plain" />
        <SectionHeading id="b" title="Labelled" label="6 packages" />
      </>,
    );
    const [plain, labelled] = Array.from(container.querySelectorAll('h2'));
    expect(plain?.className).not.toBe(labelled?.className);
    expect(screen.getByText('6 packages').tagName).toBe('SPAN');
  });

  it('renders the lead when given', () => {
    render(<SectionHeading id="a" title="T" lead="A lead." />);
    expect(screen.getByText('A lead.').tagName).toBe('P');
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <SectionHeadingShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
