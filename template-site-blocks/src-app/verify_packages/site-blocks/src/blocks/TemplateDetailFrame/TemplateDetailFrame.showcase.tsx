import { Card, CardContent, CardHeader } from '@gears-frontx/ui-kit';
import { CardTitle, Text } from '@gears-frontx/kit-candidates';
import { TemplateDetailFrame } from './TemplateDetailFrame';

export const showcase = { title: 'Template detail frame', group: 'docs', summary: 'The frame of a template page: the file explorer across the column, then the body beside the facts.', ownsPageTitle: true } as const;

export default function TemplateDetailFrameShowcase() {
  return (
    <TemplateDetailFrame
      intro={{ title: 'template-shell', lead: 'The host application: navigation, routing and the screen domain your screens mount into.' }}
      explorer={
        <Card>
          <CardContent>
            <Text tone="muted">The file explorer of the template's key files.</Text>
          </CardContent>
        </Card>
      }
      facts={
        <Card>
          <CardHeader>
            <CardTitle>Before you start</CardTitle>
          </CardHeader>
          <CardContent>
            <Text tone="muted">The facts of the template: what it needs and how to apply it.</Text>
          </CardContent>
        </Card>
      }
    >
      <Text>The page body: what the template gives, the cards that led to the explorer and the details.</Text>
    </TemplateDetailFrame>
  );
}
