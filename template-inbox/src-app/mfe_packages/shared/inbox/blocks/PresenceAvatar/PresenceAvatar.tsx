import { Avatar, AvatarBadge, AvatarFallback, type AvatarProps } from '@gears-frontx/ui-kit';
import type { Presence } from '../../api/types';
import { identityToneOf, initialsOf, labelOf } from '../../ui/format';
import type { Translate } from '../../i18n/translate';
import styles from './PresenceAvatar.module.css';

const PRESENCE_CLASS: Record<Presence, string> = {
  online: styles.presenceOnline,
  away: styles.presenceAway,
  offline: styles.presenceOffline,
};

export type PresenceAvatarProps = {
  name: string;
  presence: Presence;
  size?: AvatarProps['size'];
  t: Translate;
};

/**
 * A person's avatar with the presence dot: the identity tone and initials from
 * the name, and the dot in the presence's own colour, named for assistive
 * technology by the presence label.
 */
// @cpt-dod:cpt-template-inbox-dod-screen-frame-shared-components:p2
// @cpt-dod:cpt-template-inbox-dod-screen-frame-blocks:p2
export function PresenceAvatar({ name, presence, size, t }: PresenceAvatarProps) {
  return (
    <Avatar size={size}>
      <AvatarFallback tone={identityToneOf(name)} variant="solid">
        {initialsOf(name)}
      </AvatarFallback>
      <AvatarBadge
        className={PRESENCE_CLASS[presence]}
        role="img"
        aria-label={labelOf(presence, t)}
      />
    </Avatar>
  );
}
