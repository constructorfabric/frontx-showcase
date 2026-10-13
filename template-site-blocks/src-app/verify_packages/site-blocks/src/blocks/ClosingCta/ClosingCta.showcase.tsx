import { createElement } from 'react';
import { ClosingVisual } from '@gears-frontx/site-brand/art/ClosingVisual';
import { ClosingCta } from './ClosingCta';

export const showcase = { title: 'Closing call to action', group: 'section', summary: 'The closing band: the title beside the button and the text link on the night colour, the visual across the column under them.', fullBleed: true } as const;

export default function ClosingCtaShowcase() {
  return (
    <ClosingCta
      id="showcase-closing-cta"
      title={'Build your next app\non FrontX.'}
      actions={[
        { label: 'Get started', link: createElement('a', { href: './?screen=docs;route=get-started' }) },
        { label: 'Explore the source', link: createElement('a', { href: 'https://github.com/constructorfabric/gears-frontx' }) },
      ]}
      visual={<ClosingVisual />}
    />
  );
}
