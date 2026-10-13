import { createElement } from 'react';
import { buttonVariants } from '@gears-frontx/ui-kit';
import { Facts } from './Facts';

export const showcase = { title: 'Facts', group: 'docs', summary: 'What to know before starting: a titled card of name and value pairs with actions.' } as const;

export default function FactsShowcase() {
  return (
    <Facts
      title="Before you start"
      facts={[
        { label: 'Template type', value: 'Application foundation' },
        { label: 'Requires', value: 'A new project' },
        { label: 'Source version', value: '0.1.0-alpha.5' },
      ]}
      actions={createElement('a', { href: '/?screen=docs;route=get-started', className: buttonVariants({ variant: 'outline' }) }, 'Run Shell + MFE')}
    />
  );
}
