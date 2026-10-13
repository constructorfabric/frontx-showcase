import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { ClockIcon } from 'lucide-react';
import { Badge, Button } from '@gears-frontx/ui-kit';
import {
  StatBreakdownCard,
  StatChartCard,
  StatDonutCard,
  StatHeroCard,
  StatKpiCard,
  StatSummaryCard,
  StatTrendCard,
} from '@inbox-shared/blocks/StatCard';
import { expectNoAxeViolations } from './axe';

const chart = (name: string) => <div role="img" aria-label={name} />;

describe('StatCard', () => {
  it('hides the KPI sparkline from assistive technology and pairs the footer figure with its name', async () => {
    const { container } = render(
      <StatKpiCard
        value="24"
        delta={<Badge variant="secondary">+4%</Badge>}
        label="Open conversations"
        chart={<svg data-testid="spark" />}
        footer={{ label: 'Oldest open', value: '3d' }}
      />
    );
    expect(screen.getByText('24')).toBeTruthy();
    expect(screen.getByTestId('spark').closest('[aria-hidden="true"]')).not.toBeNull();
    const term = screen.getByText('Oldest open');
    expect(term.tagName).toBe('DT');
    expect(term.nextElementSibling?.textContent).toBe('3d');
    await expectNoAxeViolations(container);
  });

  it('gives each titled arrangement its title, figure, breakdown and chart', async () => {
    const { container } = render(
      <>
        <StatHeroCard
          title="New contacts"
          value="131"
          delta={<Badge variant="secondary">+8%</Badge>}
          stats={[
            { label: 'Inbound', value: '90' },
            { label: 'Outbound', value: '41' },
          ]}
          chart={chart('New contacts: chart')}
        />
        <StatChartCard title="Resolved per day" chart={chart('Resolved per day: chart')} />
        <StatSummaryCard
          title="Summary"
          figures={[{ icon: <ClockIcon />, value: '7', label: 'Pending' }]}
          chart={chart('Activity trend: chart')}
          action={<Button variant="outline">View report</Button>}
        />
        <StatTrendCard
          title="Records created"
          action={<Button variant="outline">Period</Button>}
          value="266"
          description="New records in the last 12 months"
          chart={chart('Records created: chart')}
        />
        <StatBreakdownCard title="Stage funnel" value="120" description="Contacts by stage" chart={chart('Stage funnel: chart')} />
      </>
    );
    for (const title of ['New contacts', 'Resolved per day', 'Summary', 'Records created', 'Stage funnel']) {
      expect(screen.getByText(title)).toBeTruthy();
      expect(screen.getByRole('img', { name: `${title === 'Summary' ? 'Activity trend' : title}: chart` })).toBeTruthy();
    }
    expect(screen.getByText('Inbound').nextElementSibling?.textContent).toBe('90');
    expect(screen.getByRole('button', { name: 'View report' })).toBeTruthy();
    expect(screen.getByText('266')).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it('lists each donut segment with its count and share', async () => {
    const { container } = render(
      <StatDonutCard
        title="Contacts by stage"
        chart={<div aria-hidden="true" />}
        legend={[
          { id: 'lead', label: 'Lead', count: '15', percent: '25%', color: 'rgb(1, 2, 3)' },
          { id: 'customer', label: 'Customer', count: '45', percent: '75%' },
        ]}
      />
    );
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText('15')).toBeTruthy();
    expect(within(rows[0]).getByText('25%')).toBeTruthy();
    await expectNoAxeViolations(container);
  });
});
