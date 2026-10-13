import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PanelLeftIcon } from 'lucide-react';
import { Button, Input } from '@gears-frontx/ui-kit';
import { Heading } from '@gears-frontx/kit-candidates';
import {
  ListPane,
  ListPaneBody,
  ListPaneGroup,
  ListPaneSearch,
  ListPaneTabs,
  ListPaneToolbar,
} from '@inbox-shared/blocks/ListPane';
import { ThreadListItem } from '@inbox-shared/blocks/ThreadListItem';
import { expectNoAxeViolations } from './axe';

const row = (id: string) => (
  <ThreadListItem key={id} avatar={null} title={`Subject ${id}`} time="9:15" preview="Hello" selected={false} onSelect={() => {}} />
);

describe('ListPane', () => {
  it('is a named section with the heading, the count and its rows as list items of every group', async () => {
    const { container } = render(
      <ListPane
        label="Conversations"
        hidden={false}
        leading={<Button variant="ghost" icon={<PanelLeftIcon />} aria-label="Toggle channels" />}
        heading={<Heading size="heading-2" render={createElement('h1')}>General</Heading>}
        count={3}
      >
        <ListPaneSearch>
          <Input type="search" aria-label="Search conversations" />
        </ListPaneSearch>
        <ListPaneToolbar summary="2 open" control={<Button variant="outline">Sort</Button>} />
        <ListPaneBody>
          <ListPaneGroup label="Pinned">{[row('a')]}</ListPaneGroup>
          <ListPaneGroup>{[row('b'), row('c')]}</ListPaneGroup>
        </ListPaneBody>
      </ListPane>
    );
    expect(screen.getByRole('region', { name: 'Conversations' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1, name: 'General' })).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText('2 open')).toBeTruthy();
    const lists = screen.getAllByRole('list');
    expect(lists).toHaveLength(2);
    expect(lists.map((list) => list.querySelectorAll(':scope > [role="listitem"]').length)).toEqual([1, 2]);
    await expectNoAxeViolations(container);
  });

  it('marks itself hidden for the single-pane layout', () => {
    render(
      <ListPane label="Conversations" hidden heading={<span>General</span>} count={0}>
        <ListPaneBody>{null}</ListPaneBody>
      </ListPane>
    );
    expect(document.querySelector('section')?.className).toMatch(/singlePaneHidden/);
  });

  it('switches its tabs, each panel holding its own rows', async () => {
    const onValueChange = vi.fn();
    render(
      <ListPane label="Inbox" hidden={false} heading={<span>Inbox</span>} count={2}>
        <ListPaneTabs
          value="all"
          onValueChange={onValueChange}
          tabs={[
            { value: 'all', label: 'All', content: <ListPaneBody>All rows</ListPaneBody> },
            { value: 'unread', label: 'Unread', content: <ListPaneBody>Unread rows</ListPaneBody> },
          ]}
        />
      </ListPane>
    );
    expect(screen.getByText('All rows')).toBeTruthy();
    await userEvent.click(screen.getByRole('tab', { name: 'Unread' }));
    expect(onValueChange.mock.calls[0]?.[0]).toBe('unread');
  });
});
