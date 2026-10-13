import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemGroup } from '@gears-frontx/ui-kit';
import { VisuallyHidden } from '@gears-frontx/kit-candidates';
import {
  ThreadListItem,
  ThreadListItemPin,
  ThreadListItemStar,
  ThreadListItemUnread,
} from '@inbox-shared/blocks/ThreadListItem';
import { expectNoAxeViolations } from './axe';

describe('ThreadListItem', () => {
  it('is a button with the title, the time, the preview and its named marks, current when selected', async () => {
    const onSelect = vi.fn();
    const { container } = render(
      <ItemGroup role="presentation">
        <ThreadListItem
          avatar={null}
          title={
            <>
              <VisuallyHidden>Unread.</VisuallyHidden>Ada Lovelace
            </>
          }
          time="9:15"
          preview="Subject - the snippet"
          titleMarks={
            <>
              <ThreadListItemPin label="Pinned" />
              <ThreadListItemStar label="Starred" />
            </>
          }
          previewMarks={<ThreadListItemUnread count={2} label="2 unread messages" />}
          selected
          onSelect={onSelect}
        />
      </ItemGroup>
    );
    const button = screen.getByRole('button', { name: /Ada Lovelace/ });
    expect(button.getAttribute('aria-current')).toBe('true');
    expect(screen.getByText('9:15')).toBeTruthy();
    expect(screen.getByText('Subject - the snippet')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Pinned' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Starred' })).toBeTruthy();
    expect(screen.getByLabelText('2 unread messages').textContent).toBe('2');
    await userEvent.click(button);
    expect(onSelect).toHaveBeenCalledTimes(1);
    await expectNoAxeViolations(container);
  });

  it('steps a read row down and leaves an unread one at full strength', () => {
    render(
      <ItemGroup role="presentation">
        <ThreadListItem avatar={null} title="Read" time="9:00" preview="a" selected={false} read onSelect={() => {}} />
        <ThreadListItem avatar={null} title="Unread" time="9:00" preview="b" selected={false} onSelect={() => {}} />
      </ItemGroup>
    );
    const [read, unread] = screen.getAllByRole('button');
    expect(read.className).toMatch(/read/);
    expect(unread.className).not.toMatch(/read/);
    expect(unread.getAttribute('aria-current')).toBeNull();
  });
});
