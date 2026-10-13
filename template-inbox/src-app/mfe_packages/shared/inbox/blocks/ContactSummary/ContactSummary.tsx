import type { ReactNode } from 'react';
import { Heading, Text } from '@gears-frontx/kit-candidates';
import styles from './ContactSummary.module.css';

export type ContactSummaryProps = {
  /** The person's avatar, usually `PresenceAvatar` at the kit's large size. */
  avatar: ReactNode;
  name: string;
  /** One muted line under the name: the presence, an email address. */
  meta: string;
  /** A kit `Badge` under the meta line: the contact's type. */
  badge?: ReactNode;
  /** One action under it all: a button opening the contact's page. */
  action?: ReactNode;
};

/** A person at a glance, centred: avatar, name, one line about them, a badge and an action. */
// @cpt-dod:cpt-template-inbox-dod-screen-frame-blocks:p2
export function ContactSummary({ avatar, name, meta, badge, action }: ContactSummaryProps) {
  return (
    <div className={styles.summary}>
      {avatar}
      <Heading size="heading-2" render={<span />}>
        {name}
      </Heading>
      <Text variant="meta" tone="muted" render={<span />}>
        {meta}
      </Text>
      {badge}
      {action}
    </div>
  );
}
