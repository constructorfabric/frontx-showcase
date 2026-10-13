import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@gears-frontx/ui-kit';
import { InspectorPanel, InspectorStack } from '@inbox-shared/blocks/InspectorPanel';
import { expectNoAxeViolations } from './axe';

describe('InspectorPanel', () => {
  it('is a named complementary landmark with tabs, the first one open', async () => {
    const { container } = render(
      <InspectorPanel
        label="Customer details"
        tabs={[
          {
            value: 'details',
            label: 'Details',
            content: (
              <InspectorStack>
                <Button variant="outline">Mark as spam</Button>
              </InspectorStack>
            ),
          },
          { value: 'assistant', label: 'Assistant', content: <p>Ask the assistant</p> },
        ]}
      />
    );
    expect(screen.getByRole('complementary', { name: 'Customer details' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Mark as spam' })).toBeTruthy();
    await expectNoAxeViolations(container);
    await userEvent.click(screen.getByRole('tab', { name: 'Assistant' }));
    expect(await screen.findByText('Ask the assistant')).toBeTruthy();
  });
});
