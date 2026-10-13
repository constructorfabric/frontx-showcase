import { createElement } from 'react';
import { buttonVariants } from '@gears-frontx/ui-kit';
import { ActionRow } from './ActionRow';

export const showcase = { title: 'Action row', group: 'docs', summary: 'A row of actions in a page body: side by side with a gap, one under the other on a phone.' } as const;

export default function ActionRowShowcase() {
  return (
    <ActionRow>
      {createElement('a', { href: '/?screen=templates;route=template-mfe', className: buttonVariants() }, 'Explore MFE source')}
      {createElement('a', { href: '/?screen=catalogue', className: buttonVariants({ variant: 'outline' }) }, 'UI Kit integration')}
    </ActionRow>
  );
}
