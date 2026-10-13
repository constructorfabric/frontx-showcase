import { createElement } from 'react';
import { SectionHeading } from '../SectionHeading';
import { CardTiles } from './CardTiles';

export const showcase = { title: 'Card tiles', group: 'docs', summary: 'Related pages as small whole-card links in a grid that fits the width.' } as const;

export default function CardTilesShowcase() {
  return (
    <>
      <SectionHeading id="showcase-related" title="Related pages" />
      <CardTiles
        items={[
          { eyebrow: 'Library', title: 'Routing', text: 'How screens and routes are declared and resolved.', link: createElement('a', { href: '/?screen=libs;route=routing' }) },
          { eyebrow: 'Library', title: 'MFE runtime', text: 'Registration, loading and host communication.', link: createElement('a', { href: '/?screen=libs;route=mfes' }) },
          { eyebrow: 'Library', title: 'Screen domain', text: 'The extension domain screens mount into.', link: createElement('a', { href: '/?screen=libs;route=screen-domain' }) },
        ]}
      />
    </>
  );
}
