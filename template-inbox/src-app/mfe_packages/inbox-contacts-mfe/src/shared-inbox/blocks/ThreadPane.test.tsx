import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArrowLeftIcon, ReplyIcon } from 'lucide-react';
import { Button, MessageScrollerProvider } from '@gears-frontx/ui-kit';
import { Heading } from '@gears-frontx/kit-candidates';
import {
  ThreadPane,
  ThreadPaneHeader,
  ThreadPaneToolbar,
  ThreadPlainText,
  ThreadSuggestions,
  ThreadTranscript,
} from '@inbox-shared/blocks/ThreadPane';
import { expectNoAxeViolations } from './axe';

describe('ThreadPane', () => {
  it('lays out the toolbar, the header lines, the transcript and the suggestions, and hands a chosen suggestion back', async () => {
    const onUse = vi.fn();
    const { container } = render(
      <ThreadPane>
        <ThreadPaneToolbar
          leading={<Button variant="ghost" icon={<ArrowLeftIcon />} aria-label="Back" />}
          start={<Button variant="ghost">Archive</Button>}
          end={<Button variant="ghost" icon={<ReplyIcon />} aria-label="Reply" />}
        />
        <ThreadPaneHeader
          heading={<Heading size="heading-2" render={createElement('h1')}>Invoice question</Heading>}
          subtitle="Ada Lovelace"
          detail="Reply to ada@example.com"
          actions={<Button variant="outline">Close</Button>}
        />
        <MessageScrollerProvider>
          <ThreadTranscript>
            <ThreadPlainText>{'Line one\nLine two'}</ThreadPlainText>
          </ThreadTranscript>
        </MessageScrollerProvider>
        <ThreadSuggestions label="Suggested replies" replies={['Thanks!', 'On it']} onUse={onUse} />
      </ThreadPane>
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Invoice question' })).toBeTruthy();
    expect(screen.getByText('Ada Lovelace')).toBeTruthy();
    expect(screen.getByText('Reply to ada@example.com')).toBeTruthy();
    expect(screen.getByText(/Line one/).textContent).toBe('Line one\nLine two');
    const group = screen.getByRole('group', { name: 'Suggested replies' });
    await userEvent.click(screen.getByRole('button', { name: 'On it' }));
    expect(onUse).toHaveBeenCalledWith('On it');
    expect(group.childElementCount).toBe(2);
    await expectNoAxeViolations(container);
  });
});
