import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PresenceAvatar } from '@inbox-shared/blocks/PresenceAvatar';
import { t as translate } from '../../test-support/translate';
import { expectNoAxeViolations } from './axe';

describe('PresenceAvatar', () => {
  it('names the dot by the presence and gives each presence its own dot', async () => {
    const { container } = render(
      <>
        <PresenceAvatar name="Ada Lovelace" presence="online" t={translate} />
        <PresenceAvatar name="Grace Hopper" presence="away" t={translate} />
        <PresenceAvatar name="Alan Turing" presence="offline" t={translate} />
      </>
    );
    const dots = ['Online', 'Away', 'Offline'].map((name) => screen.getByRole('img', { name }));
    expect(new Set(dots.map((dot) => dot.className)).size).toBe(3);
    expect(screen.getByText('AL')).toBeTruthy();
    await expectNoAxeViolations(container);
  });
});
