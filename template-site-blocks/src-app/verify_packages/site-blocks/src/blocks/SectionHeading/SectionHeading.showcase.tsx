import { SectionHeading } from './SectionHeading';

export const showcase = { title: 'Section heading', group: 'docs', summary: 'The title of a section of an inner page, with a lead or a label.' } as const;

export default function SectionHeadingShowcase() {
  return (
    <>
      <SectionHeading id="showcase-tools" title="Source & tools" />
      <SectionHeading id="showcase-understand" title="Understand the templates" lead="What each template gives you, and how they fit together." />
      <SectionHeading id="showcase-libraries" title="Libraries" label="6 packages" />
    </>
  );
}
