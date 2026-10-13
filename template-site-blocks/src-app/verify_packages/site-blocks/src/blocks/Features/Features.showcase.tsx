import { createElement } from 'react';
import { HairlineFigure } from '@gears-frontx/site-brand/art/HairlineFigure';
import { Features } from './Features';

export const showcase = { title: 'Features', group: 'section', summary: 'What a product gives, three across: a figure over each title, a sentence and a link.', fullBleed: true } as const;

export default function FeaturesShowcase() {
  return (
    <Features
      id="showcase-features"
      title="The groundwork, already connected."
      items={[
        { figure: <HairlineFigure stock="hub" />, title: 'App Shell', text: 'Navigation and routing, ready for your application.', action: { label: 'Explore the Shell', link: createElement('a', { href: './?screen=templates;route=template-shell' }) } },
        { figure: <HairlineFigure stock="riffle" />, title: 'Screen templates', text: 'A starting point for screens that connect to your application.', action: { label: 'Explore screen templates', link: createElement('a', { href: './?screen=templates;route=template-mfe' }) } },
        { figure: <HairlineFigure stock="turntable" />, title: 'Shared UI & conventions', text: 'Reusable controls and design rules for people and coding agents.', action: { label: 'Explore Design Guardrails', link: createElement('a', { href: './?screen=templates;route=template-design-guardrails' }) } },
      ]}
    />
  );
}
