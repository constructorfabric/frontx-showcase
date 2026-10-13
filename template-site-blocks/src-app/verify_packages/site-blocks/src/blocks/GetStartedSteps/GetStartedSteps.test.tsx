import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createElement } from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { GetStartedSteps } from './GetStartedSteps';
import GetStartedStepsShowcase, { showcase } from './GetStartedSteps.showcase';

const moduleCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'GetStartedSteps.module.css'), 'utf8');

const steps = [
  { title: 'Install & assemble', text: 'Set up the Shell.', link: createElement('a', { href: '/get-started' }), figure: <svg data-testid="figure-1" /> },
  { title: 'Run it locally', text: 'Start both together.', link: createElement('a', { href: '/get-started#run' }) },
];

describe('GetStartedSteps', () => {
  it('is a region named by its level-two title, with the lead, the link and an ordered list of steps', () => {
    render(<GetStartedSteps id="steps" title={'A running app.\nThen your first change.'} lead="Install the templates." action={{ label: 'Open the guide', link: createElement('a', { href: '/guide' }) }} steps={steps} />);
    const region = screen.getByRole('region', { name: 'A running app.\nThen your first change.' });
    expect(within(region).getByRole('heading', { level: 2 }).id).toBe('steps');
    expect(within(region).getByText('Install the templates.')).toBeTruthy();
    expect(within(region).getByRole('link', { name: /Open the guide/ }).getAttribute('href')).toBe('/guide');
    const list = region.querySelector('ol');
    expect(list?.children).toHaveLength(2);
  });

  it('makes each step one link named by its title, under a level-three heading, with its text and a decorative figure', () => {
    render(<GetStartedSteps id="s" title="T" steps={steps} />);
    const link = screen.getByRole('link', { name: 'Install & assemble' });
    expect(link.getAttribute('href')).toBe('/get-started');
    expect(link.closest('h3')).toBeTruthy();
    expect(screen.getByText('Set up the Shell.')).toBeTruthy();
    expect(screen.getByTestId('figure-1').closest('[aria-hidden="true"]')).toBeTruthy();
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
        <GetStartedStepsShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
