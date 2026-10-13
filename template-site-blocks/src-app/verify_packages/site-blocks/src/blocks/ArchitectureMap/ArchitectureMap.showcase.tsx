import { createElement } from 'react';
import { ArchitectureFigure } from '@gears-frontx/site-brand/art/ArchitectureFigure';
import { ArchitectureMap } from './ArchitectureMap';

export const showcase = { title: 'Architecture map', group: 'section', summary: 'How a product is put together: the label, the title and the lead over a map drawn by brand art.', fullBleed: true } as const;

export default function ArchitectureMapShowcase() {
  return (
    <ArchitectureMap
      id="showcase-architecture-map"
      label="Inside FrontX"
      title={'One shell.\nIndependent screens.'}
      lead="The Shell hosts your screens. Reuse UI components across them, and apply shared design rules while you build."
      map={
        <ArchitectureFigure
          label="The App Shell contains independent screens. Both can reuse the optional UI Kit. Design Guardrails guide development."
          kit={{ note: 'Optional', title: 'UI Kit', link: createElement('a', { href: './?screen=catalogue' }) }}
          rules={{ note: 'While you build', title: 'Design\nGuardrails', link: createElement('a', { href: './?screen=templates;route=template-design-guardrails' }) }}
          shell={{ title: 'App Shell', link: createElement('a', { href: './?screen=templates;route=template-shell' }), templates: { label: 'Screen templates', link: createElement('a', { href: './?screen=templates;route=template-mfe' }) } }}
          screens={[
            { title: 'Screen A', hint: 'explore screen templates', link: createElement('a', { href: './?screen=templates;route=template-mfe' }) },
            { title: 'Screen B', hint: 'explore screen templates', link: createElement('a', { href: './?screen=templates;route=template-mfe' }) },
          ]}
          wires={{ kit: 'Shared components', rules: 'Shared rules' }}
        />
      }
    />
  );
}
