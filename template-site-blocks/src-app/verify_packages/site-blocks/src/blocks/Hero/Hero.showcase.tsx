import { createElement } from 'react';
import { HeroArt } from '@gears-frontx/site-brand/art/HeroArt';
import { Hero } from './Hero';

export const showcase = { title: 'Hero', group: 'section', summary: 'The landing page opening: the page title, the lead, the two actions and the art row on the brand-blue band.', ownsPageTitle: true, fullBleed: true } as const;

export default function HeroShowcase() {
  return (
    <Hero
      title={'Build complex apps.\nWith a shared foundation.'}
      lead="FrontX is an open-source development kit for complex web interfaces, designed for AI-assisted coding."
      actions={[
        { label: 'Get started', link: createElement('a', { href: './?screen=docs' }) },
        { label: 'View on GitHub', link: createElement('a', { href: 'https://github.com/constructorfabric/gears-frontx' }) },
      ]}
      art={<HeroArt label="A FrontX shell with its navigation hosting two independent screens, both built from the shared UI kit." />}
    />
  );
}
