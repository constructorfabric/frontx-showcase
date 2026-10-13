import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { SectionFrame } from './SectionFrame';
import SectionFrameShowcase, { showcase } from './SectionFrame.showcase';

const moduleCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'SectionFrame.module.css'), 'utf8');

describe('SectionFrame', () => {
  it('is a region named by its level-two title', () => {
    render(<SectionFrame id="arch" title="One shell." >Body</SectionFrame>);
    const region = screen.getByRole('region', { name: 'One shell.' });
    expect(screen.getByRole('heading', { level: 2, name: 'One shell.' }).id).toBe('arch');
    expect(region.textContent).toContain('Body');
  });

  it('renders the label, note, lead and action when given, and no aside without them', () => {
    const { rerender, container } = render(
      <SectionFrame id="a" label="Inside FrontX" title="T" note="Illustrative" lead="Lead text" action={<a href="/x">More</a>}>
        Body
      </SectionFrame>,
    );
    expect(screen.getByText('Inside FrontX')).toBeTruthy();
    expect(screen.getByText('Illustrative')).toBeTruthy();
    expect(screen.getByText('Lead text')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'More' })).toBeTruthy();
    rerender(<SectionFrame id="a" title="T">Body</SectionFrame>);
    expect(container.querySelector('header')?.children).toHaveLength(1);
  });

  it('takes its padding from the layout tokens and declares no colour literal', () => {
    expect(moduleCss).toMatch(/padding:\s*var\(--site-section-pad-top\)\s+0\s+var\(--site-section-pad-bottom\)/);
    expect(moduleCss).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(moduleCss).toMatch(/grid-template-columns:\s*var\(--site-heading-columns\)/);
  });

  it('names its showcase fixture', () => {
    expect(showcase.group).toBe('section');
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <SectionFrameShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
