import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { GuideClosingHeading } from './GuideClosingHeading';
import GuideClosingHeadingShowcase, { showcase } from './GuideClosingHeading.showcase';

const moduleCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'GuideClosingHeading.module.css'), 'utf8');

describe('GuideClosingHeading', () => {
  it('is a level-two jump target with its id, ruled off above, with its lead', () => {
    const { container } = render(<GuideClosingHeading id="more" title="Where to go next" lead="Guides that build on this one." />);
    const heading = screen.getByRole('heading', { level: 2, name: 'Where to go next' });
    expect(heading.id).toBe('more');
    expect(heading.getAttribute('tabindex')).toBe('-1');
    expect(screen.getByText('Guides that build on this one.')).toBeTruthy();
    const rule = container.querySelector('[data-slot="separator"], [role="separator"]');
    expect(rule).toBeTruthy();
    expect(rule!.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders no lead when none is given', () => {
    const { container } = render(<GuideClosingHeading id="m" title="T" />);
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });

  it('declares layout only, no colour literal', () => {
    expect(moduleCss).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|color\s*:|background|border(-top|-bottom)?\s*:/i);
  });

  it('is a fixture of the docs group', () => {
    expect(showcase.group).toBe('docs');
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <GuideClosingHeadingShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
