import { Link } from '@gears-frontx/kit-candidates';

import { GuideStepUnnumbered } from './GuideStepUnnumbered';

export const showcase = { title: 'Guide step, unnumbered', group: 'docs', summary: 'The closing section of a guide drawn as a step without a number: rule, title, lead and links.' } as const;

export default function GuideStepUnnumberedShowcase() {
  return (
    <GuideStepUnnumbered
      id="changes"
      title="Keep track of your changes"
      lead=".frontx/provenance.json records which templates and source versions were applied. It does not prove that your local edits will merge automatically. Keep a recoverable copy of your work and review changes before any upgrade."
      links={<Link href="#limits">Quickstart verification and limits</Link>}
    />
  );
}
