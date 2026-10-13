import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Empty, EmptyDescription, EmptyHeader, Spinner } from '@gears-frontx/ui-kit';
import { EmptyTitle } from '@gears-frontx/kit-candidates';
import { PaneState } from '@inbox-shared/blocks/PaneState';
import { expectNoAxeViolations } from './axe';

describe('PaneState', () => {
  it('holds a kit state component and passes the status role, busy flag and test id through', async () => {
    const { container } = render(
      <PaneState role="status" aria-busy data-testid="loading">
        <Spinner role="presentation" aria-hidden="true" />
      </PaneState>
    );
    const pane = screen.getByRole('status');
    expect(pane.getAttribute('aria-busy')).toBe('true');
    expect(pane.dataset.testid).toBe('loading');
    await expectNoAxeViolations(container);
  });

  it('centres an empty state whose title is a heading', async () => {
    const { container } = render(
      <PaneState>
        <Empty>
          <EmptyHeader>
            <EmptyTitle render={createElement('h1')}>Nothing here</EmptyTitle>
            <EmptyDescription>Pick something on the left.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </PaneState>
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Nothing here' })).toBeTruthy();
    await expectNoAxeViolations(container);
  });
});
