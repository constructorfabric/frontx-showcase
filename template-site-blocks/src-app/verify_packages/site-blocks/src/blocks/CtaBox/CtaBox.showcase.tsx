import { createElement } from 'react';
import { buttonVariants } from '@gears-frontx/ui-kit';
import { CtaBox } from './CtaBox';

export const showcase = { title: 'CTA box', group: 'docs', summary: 'The call to action that closes a guide: a tinted box with a title, a sentence and one action.' } as const;

export default function CtaBoxShowcase() {
  return (
    <CtaBox
      title="Make it yours"
      text="Change the existing Blank Home screen, rebuild it, and see the change in the running shell."
      action={createElement('a', { href: '/?screen=docs;route=first-change', className: buttonVariants({ variant: 'default' }) }, 'Make your first change')}
    />
  );
}
