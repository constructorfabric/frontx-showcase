import { createElement } from 'react';
import { CardContent, CardHeader } from '@gears-frontx/ui-kit';
import { Card, CardTitle, DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from '@gears-frontx/kit-candidates';

// @cpt-dod:cpt-template-mfe-demo-dod-screen-entries-screen-blocks:p2
// @cpt-algo:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2
// @cpt-begin:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2:inst-bridge-info
export interface BridgeInfoRow {
  label: string;
  /** An identifier or a property value, shown in the monospace face and wrapped anywhere so a long one never widens the page. */
  value: string;
}

export interface BridgeInfoCardProps {
  title: string;
  rows: readonly BridgeInfoRow[];
}

/*
 * The facts a screen reads from its bridge (the domain and instance it is mounted as, the shell's theme and language) as a titled card of label and value pairs. Built from kit parts only, so it carries no stylesheet.
 */
export function BridgeInfoCard({ title, rows }: BridgeInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle render={createElement('h2')}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <DescriptionList size="sm">
          {rows.map((row) => (
            <DescriptionItem key={row.label}>
              <DescriptionTerm>{row.label}</DescriptionTerm>
              <DescriptionDetails variant="mono">{row.value}</DescriptionDetails>
            </DescriptionItem>
          ))}
        </DescriptionList>
      </CardContent>
    </Card>
  );
}
// @cpt-end:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2:inst-bridge-info
