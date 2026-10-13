import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../test-support/axe';
import { ChartThumb, type ChartThumbName } from './ChartThumb';
import { MetricBars } from './MetricBars';

const CHARTS: ChartThumbName[] = ['area', 'bar', 'distribution', 'trends'];

describe('ChartThumb', () => {
  it.each(CHARTS)('draws the %s thumbnail in the kit chart container', (chart) => {
    const { container } = render(<ChartThumb chart={chart} />);
    expect(container.querySelector('[data-chart]')).not.toBeNull();
  });

  it('shows the donut label and the trend caption', () => {
    const { getByText } = render(
      <>
        <ChartThumb chart="distribution" centre="Total" />
        <ChartThumb chart="trends" caption={{ label: 'Weekly', value: '+12%' }} />
      </>,
    );
    expect(getByText('Total')).toBeTruthy();
    expect(getByText('Weekly')).toBeTruthy();
    expect(getByText('+12%')).toBeTruthy();
  });

  it('passes axe', async () => {
    const { container } = render(
      <div>
        {CHARTS.map((chart) => (
          <ChartThumb key={chart} chart={chart} centre="Total" caption={{ label: 'Weekly', value: '+12%' }} />
        ))}
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});

describe('MetricBars', () => {
  const bars = [
    { label: 'Ad hoc\nprompts', share: 40, tone: 'reference' as const },
    { label: 'With FrontX', share: 85, tone: 'featured' as const },
  ];

  it('draws one bar per entry by proportion, with no figure on it', () => {
    const { container } = render(<MetricBars bars={bars} />);
    expect(container.querySelector('[data-chart]')).not.toBeNull();
    expect(container.textContent).not.toMatch(/\d/);
  });

  it('passes axe', async () => {
    const { container } = render(<MetricBars bars={bars} />);
    await expectNoAxeViolations(container);
  });
});
