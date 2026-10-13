import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardContent, CardHeader, CardTitle } from '@gears-frontx/ui-kit';
import { ColumnsLayout } from '@inbox-shared/blocks/ColumnsLayout';
import { expectNoAxeViolations } from './axe';

const card = (title: string) => (
  <Card size="sm">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>{title} body</CardContent>
  </Card>
);

describe('ColumnsLayout', () => {
  it('places the start, main and end content in three columns in that order', async () => {
    const { container } = render(<ColumnsLayout start={card('Details')} main={card('Tickets')} end={card('Recent activity')} />);
    const grid = container.firstElementChild;
    expect(grid?.children).toHaveLength(3);
    expect(grid?.children[0].textContent).toContain('Details');
    expect(grid?.children[1].textContent).toContain('Tickets');
    expect(grid?.children[2].textContent).toContain('Recent activity');
    expect(screen.getByText('Tickets body')).toBeTruthy();
    await expectNoAxeViolations(container);
  });
});
