import { createElement } from 'react';
import { Text } from '@gears-frontx/kit-candidates';

import { SectionHeading } from '../SectionHeading/SectionHeading';
import { DocsFrame } from './DocsFrame';

export const showcase = { title: 'Docs frame', group: 'docs', summary: 'The frame of an inner page: intro, tab bar and body in the page column.', ownsPageTitle: true } as const;

const here = './?screen=blocks;route=docs-frame';

export default function DocsFrameShowcase() {
  return (
    <DocsFrame
      intro={{ title: 'Build with FrontX.', lead: 'Start with a project template, or bring individual libraries into your application.' }}
      nav={{
        label: 'Docs pages',
        items: [
          { id: 'overview', label: 'Overview', current: true, render: createElement('a', { href: here }) },
          { id: 'start', label: 'Run Shell + MFE', current: false, render: createElement('a', { href: here }) },
          { id: 'change', label: 'First change', current: false, render: createElement('a', { href: here }) },
          { id: 'libraries', label: 'Libraries', current: false, render: createElement('a', { href: here }) },
        ],
      }}
    >
      <SectionHeading id="showcase-docs-tools" title="Source & tools" />
      <Text>The page body: sections, cards and steps.</Text>
    </DocsFrame>
  );
}
