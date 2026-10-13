import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, Button } from '@gears-frontx/ui-kit';
import { ContactSummary } from '@inbox-shared/blocks/ContactSummary';
import { PresenceAvatar } from '@inbox-shared/blocks/PresenceAvatar';
import { t as translate } from '../../test-support/translate';
import { expectNoAxeViolations } from './axe';

describe('ContactSummary', () => {
  it('shows the avatar, the name as text rather than an outline heading, the meta line, the badge and the action', async () => {
    const { container } = render(
      <ContactSummary
        avatar={<PresenceAvatar name="Ada Lovelace" presence="online" size="lg" t={translate} />}
        name="Ada Lovelace"
        meta="ada@example.com"
        badge={<Badge variant="secondary">Lead</Badge>}
        action={<Button variant="outline">View contact</Button>}
      />
    );
    expect(screen.getByText('Ada Lovelace').tagName).toBe('SPAN');
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByText('ada@example.com')).toBeTruthy();
    expect(screen.getByText('Lead')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'View contact' })).toBeTruthy();
    await expectNoAxeViolations(container);
  });
});
