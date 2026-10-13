import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { DetailPane } from '@inbox-shared/blocks/DetailPane';
import { expectNoAxeViolations } from './axe';

describe('DetailPane', () => {
  it('holds the open item, hides for the single-pane layout and grows its minimum while an inspector panel is open', async () => {
    const { container, rerender } = render(
      <DetailPane hidden={false}>
        <p>Thread</p>
      </DetailPane>
    );
    const pane = () => container.firstElementChild as HTMLElement;
    expect(pane().className).not.toMatch(/singlePaneHidden|detailPaneWithDetails/);
    await expectNoAxeViolations(container);
    rerender(
      <DetailPane hidden asideOpen>
        <p>Thread</p>
      </DetailPane>
    );
    expect(pane().className).toMatch(/singlePaneHidden/);
    expect(pane().className).toMatch(/detailPaneWithDetails/);
  });
});
