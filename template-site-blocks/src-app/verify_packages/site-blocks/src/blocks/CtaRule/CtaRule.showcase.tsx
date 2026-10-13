import { Link } from '@gears-frontx/kit-candidates';
import { CtaRule } from './CtaRule';

export const showcase = { title: 'CTA rule', group: 'docs', summary: 'The call to action that closes an index: an open row under a rule with the action at its end.' } as const;

export default function CtaRuleShowcase() {
  return (
    <CtaRule
      title="Start with Shell + MFE."
      text="Run the host and its included screens together, then change one of them."
      action={<Link href="/?screen=docs;route=get-started">Run the quickstart →</Link>}
    />
  );
}
