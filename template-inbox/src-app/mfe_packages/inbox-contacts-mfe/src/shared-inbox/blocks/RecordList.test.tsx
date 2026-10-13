import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@gears-frontx/ui-kit';
import { RecordList } from '@inbox-shared/blocks/RecordList';
import { expectNoAxeViolations } from './axe';

describe('RecordList', () => {
  it('lists each record as a list item with its title, meta, description and status', async () => {
    const { container } = render(
      <RecordList
        items={[
          { id: 't1', title: 'Cannot sign in', description: '#12, opened Mar 3', trailing: <Badge variant="secondary">Open</Badge> },
          { id: 'c1', title: 'Billing question', meta: 'Chat, 2 days ago', description: 'Thanks, that helps.' },
        ]}
      />
    );
    expect(screen.getByRole('list')).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Cannot sign in')).toBeTruthy();
    expect(screen.getByText('Chat, 2 days ago')).toBeTruthy();
    expect(screen.getByText('Thanks, that helps.')).toBeTruthy();
    expect(screen.getByText('Open')).toBeTruthy();
    // The kit's ItemGroup is a list: axe's aria-required-children holds it to list items.
    await expectNoAxeViolations(container);
  });
});
