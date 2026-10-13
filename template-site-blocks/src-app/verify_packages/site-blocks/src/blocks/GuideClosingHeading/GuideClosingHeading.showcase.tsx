import { Text } from '@gears-frontx/kit-candidates';
import { GuideClosingHeading } from './GuideClosingHeading';

export const showcase = { title: 'Guide closing heading', group: 'docs', summary: 'The heading of a guide\'s closing section, ruled off from the steps above it.' } as const;

export default function GuideClosingHeadingShowcase() {
  return (
    <>
      <Text tone="muted">The last step of the guide.</Text>
      <GuideClosingHeading id="showcase-guide-closing-heading" title="Keep going" lead="Guides that build on what you just ran." />
    </>
  );
}
