import { Layers, Terminal } from 'lucide-react';
import { Text } from '@gears-frontx/kit-candidates';

import { SectionHeading } from '../SectionHeading/SectionHeading';
import { DocsFrameWithRail } from './DocsFrameWithRail';

export const showcase = { title: 'Docs frame with rail', group: 'docs', summary: 'A guide page: the docs frame with a sticky "On this page" rail beside the body.', ownsPageTitle: true } as const;

const sections = [
  { id: 'showcase-rail-workspace', title: 'Create a clean workspace', text: 'Run these steps in the same terminal.' },
  { id: 'showcase-rail-install', title: 'Install the two templates', text: 'Both templates come from the same pinned source revision.' },
  { id: 'showcase-rail-assemble', title: 'Assemble Shell + MFE', text: 'Seed the host first, then add the microfrontend workspace.' },
  { id: 'showcase-rail-run', title: 'Run the included examples', text: 'Install the combined workspace, then start the host.' },
];

export default function DocsFrameWithRailShowcase() {
  return (
    <DocsFrameWithRail
      intro={{
        title: 'Run Shell + MFE.',
        lead: 'Start a host application, add its microfrontend workspace, and open the included examples.',
        meta: [
          { icon: <Terminal aria-hidden="true" />, text: 'Node.js 24.14 · npm 10' },
          { icon: <Layers aria-hidden="true" />, text: 'CLI 0.3.0' },
        ],
      }}
      rail={{ label: 'On this page', items: sections.map(({ id, title }) => ({ id, title })) }}
    >
      {sections.map((section) => (
        <div key={section.id}>
          <SectionHeading id={section.id} title={section.title} />
          <Text>{section.text}</Text>
        </div>
      ))}
    </DocsFrameWithRail>
  );
}
