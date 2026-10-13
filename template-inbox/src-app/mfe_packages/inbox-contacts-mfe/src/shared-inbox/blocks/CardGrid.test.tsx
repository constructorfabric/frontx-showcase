import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardContent, CardHeader, CardTitle } from '@gears-frontx/ui-kit';
import {
  CardBoard,
  CardRowNarrowWide,
  CardRowQuad,
  CardRowTrio,
  CardRowWideNarrow,
  CardStrip,
} from '@inbox-shared/blocks/CardGrid';
import { expectNoAxeViolations } from './axe';

const card = (title: string) => (
  <Card key={title}>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>{title} body</CardContent>
  </Card>
);

describe('CardGrid', () => {
  it('lays every row arrangement on the board in reading order', async () => {
    const { container } = render(
      <CardBoard>
        <CardRowQuad>{['A', 'B', 'C', 'D'].map(card)}</CardRowQuad>
        <CardRowTrio>{['E', 'F', 'G'].map(card)}</CardRowTrio>
        <CardRowWideNarrow>{['H', 'I'].map(card)}</CardRowWideNarrow>
        <CardRowNarrowWide>{['J', 'K'].map(card)}</CardRowNarrowWide>
        <CardStrip>
          <span>one</span>
          <span>two</span>
        </CardStrip>
      </CardBoard>
    );
    const board = container.firstElementChild as HTMLElement;
    expect(board.children).toHaveLength(5);
    expect(Array.from(board.children[0].children).map((child) => child.textContent?.slice(0, 1))).toEqual(['A', 'B', 'C', 'D']);
    expect(screen.getByText('two')).toBeTruthy();
    await expectNoAxeViolations(container);
  });
});
