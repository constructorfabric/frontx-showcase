import { DescriptionDetails, DescriptionItem, DescriptionTerm } from '@gears-frontx/kit-candidates';
import { orDash } from './format';

export type FieldRowProps = { label: string; value: string };

/**
 * A label and its value as one item of the kit candidate `DescriptionList`
 * (the caller's `<DescriptionList orientation="horizontal" size="sm">`); an
 * empty value reads as the missing-value dash.
 */
// @cpt-dod:cpt-template-inbox-dod-screen-frame-shared-components:p2
export function FieldRow({ label, value }: FieldRowProps) {
  return (
    <DescriptionItem>
      <DescriptionTerm>{label}</DescriptionTerm>
      <DescriptionDetails>{orDash(value)}</DescriptionDetails>
    </DescriptionItem>
  );
}
