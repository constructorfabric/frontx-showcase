import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert, AlertTitle, Button, Textarea } from '@gears-frontx/ui-kit';
import { ReplyComposer, ReplyComposerBox, ReplyComposerTabs } from '@inbox-shared/blocks/ReplyComposer';
import { expectNoAxeViolations } from './axe';

describe('ReplyComposer', () => {
  it('shows the notice, the tabs over one box, the hint and the send button, and switches the tab', async () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <ReplyComposer
        notice={
          <Alert variant="destructive">
            <AlertTitle>Not sent</AlertTitle>
          </Alert>
        }
      >
        <ReplyComposerTabs
          value="reply"
          onValueChange={onValueChange}
          tabs={[
            { value: 'reply', label: 'Reply' },
            { value: 'note', label: 'Note' },
          ]}
        >
          <ReplyComposerBox
            field={<Textarea aria-label="Reply" />}
            tools={<Button variant="ghost">Attach</Button>}
            hint="Ctrl+Enter to send"
            send={<Button>Send</Button>}
          />
        </ReplyComposerTabs>
      </ReplyComposer>
    );
    expect(screen.getByText('Not sent')).toBeTruthy();
    expect(screen.getAllByRole('textbox', { name: 'Reply' })).toHaveLength(1);
    expect(screen.getByText('Ctrl+Enter to send')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Send' })).toBeTruthy();
    await userEvent.click(screen.getByRole('tab', { name: 'Note' }));
    expect(onValueChange.mock.calls[0]?.[0]).toBe('note');
    await expectNoAxeViolations(container);
  });

  it('frames a note differently from a reply', () => {
    const { container, rerender } = render(
      <ReplyComposerBox field={<Textarea aria-label="Note" />} hint="" send={<Button>Add note</Button>} />
    );
    const plain = (container.firstElementChild as HTMLElement).className;
    rerender(<ReplyComposerBox note field={<Textarea aria-label="Note" />} hint="" send={<Button>Add note</Button>} />);
    expect((container.firstElementChild as HTMLElement).className).not.toBe(plain);
  });
});
