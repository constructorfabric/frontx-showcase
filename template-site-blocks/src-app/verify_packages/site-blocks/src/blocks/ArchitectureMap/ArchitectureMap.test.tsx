import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { ArchitectureMap } from './ArchitectureMap';
import ArchitectureMapShowcase, { showcase } from './ArchitectureMap.showcase';

const moduleCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'ArchitectureMap.module.css'), 'utf8');

describe('ArchitectureMap', () => {
  it('is a region named by its title with the label, the lead and the map under the header', () => {
    render(<ArchitectureMap id="arch" label="Inside FrontX" title="One shell." lead="The Shell hosts your screens." map={<svg role="img" aria-label="The map" />} />);
    const region = screen.getByRole('region', { name: 'One shell.' });
    expect(within(region).getByText('Inside FrontX')).toBeTruthy();
    expect(within(region).getByText('The Shell hosts your screens.')).toBeTruthy();
    expect(within(region).getByRole('img', { name: 'The map' })).toBeTruthy();
  });

  it('opens with a rule above the band', () => {
    const { container } = render(<ArchitectureMap id="a" title="T" map={null} />);
    expect(container.querySelector('[data-slot="separator"], [role="separator"]')).toBeTruthy();
  });

  it('sets its rhythm on the section tokens and declares no colour literal', () => {
    expect(moduleCss).toMatch(/--site-section-pad-top:/);
    expect(moduleCss).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
  });

  it('is a full-bleed fixture of the section group', () => {
    expect(showcase).toMatchObject({ group: 'section', fullBleed: true });
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <ArchitectureMapShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
