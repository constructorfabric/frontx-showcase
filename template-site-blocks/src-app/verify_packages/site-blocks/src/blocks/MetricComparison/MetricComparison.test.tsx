import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { MetricComparison } from './MetricComparison';
import MetricComparisonShowcase, { showcase } from './MetricComparison.showcase';

const moduleCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'MetricComparison.module.css'), 'utf8');

const metrics = [
  { title: 'Time to first screen', unit: 'relative', statement: 'Faster', benefit: 'to a first screen', chart: <svg data-testid="chart-a" />, explanation: 'The shell and the screen template are already wired.' },
  { title: 'Review effort', unit: 'relative', statement: 'Smaller', benefit: 'diffs to review', explanation: 'Changes stay inside one screen.' },
];

describe('MetricComparison', () => {
  it('is a region named by its title, with the note, the lead and one card per metric', () => {
    render(<MetricComparison id="ai" title="Built for AI-assisted work." lead="The lead." note="Illustrative comparison" metrics={metrics} />);
    const region = screen.getByRole('region', { name: 'Built for AI-assisted work.' });
    expect(within(region).getByText('Illustrative comparison')).toBeTruthy();
    const cards = within(region).getAllByRole('listitem');
    expect(cards).toHaveLength(2);
    expect(within(cards[0]!).getByRole('heading', { level: 3, name: 'Time to first screen' })).toBeTruthy();
    expect(within(cards[0]!).getByText('Faster')).toBeTruthy();
    expect(within(cards[0]!).getByText('to a first screen')).toBeTruthy();
    expect(within(cards[0]!).getByTestId('chart-a')).toBeTruthy();
    expect(within(cards[0]!).getByText('The shell and the screen template are already wired.')).toBeTruthy();
  });

  it('leaves out the chart slot and the unit where a metric has none', () => {
    render(<MetricComparison id="ai" title="T" metrics={[metrics[0]!, { ...metrics[1]!, unit: '' }]} />);
    const [charted, plain] = screen.getAllByRole('listitem');
    expect(within(charted!).getByText('relative')).toBeTruthy();
    expect(within(plain!).queryByText('relative')).toBeNull();
    const card = (item: HTMLElement) => item.firstElementChild as HTMLElement;
    expect(card(charted!).children).toHaveLength(4);
    expect(card(plain!).children).toHaveLength(3);
  });

  it('carries no figures of its own: every word on a card is a prop', () => {
    const { container } = render(<MetricComparison id="ai" title="T" metrics={[{ ...metrics[1]! }]} />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\d/);
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
        <MetricComparisonShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
