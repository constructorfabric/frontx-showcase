import { createElement } from 'react';
import { SectionHeading } from '../SectionHeading';
import { TemplatePair } from './TemplatePair';

export const showcase = { title: 'Template pair', group: 'docs', summary: 'Two templates applied together as two whole-card links joined by a plus sign.' } as const;

export default function TemplatePairShowcase() {
  return (
    <>
      <SectionHeading id="showcase-start" title="Start with two templates" />
      <TemplatePair
        items={[
          { title: 'Shell', text: 'A host for your web app, with routing and navigation.', link: createElement('a', { href: '/?screen=templates;route=template-shell' }) },
          { title: 'MFE workspace', text: 'Add screens that run inside the host.', link: createElement('a', { href: '/?screen=templates;route=template-mfe' }) },
        ]}
      />
    </>
  );
}
