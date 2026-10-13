import { Link, Text } from '@gears-frontx/kit-candidates';

import { SectionFrame } from './SectionFrame';

export const showcase = { title: 'Section frame', group: 'section', summary: 'A full-bleed band with its label, title, lead and link above the section body.', fullBleed: true } as const;

export default function SectionFrameShowcase() {
  return (
    <SectionFrame
      id="showcase-section-frame"
      label="Inside FrontX"
      title={'One shell.\nIndependent screens.'}
      lead="The Shell hosts your screens. Reuse UI components across them, and apply shared design rules while you build."
      action={<Link href="./?screen=templates">Screen templates</Link>}
    >
      <Text tone="muted">The section body: a figure, cards or steps.</Text>
    </SectionFrame>
  );
}
