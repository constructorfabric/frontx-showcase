import { Card, CardContent } from '@gears-frontx/ui-kit';
import { Text } from '@gears-frontx/kit-candidates';
import { ScreenFrame } from './ScreenFrame';

export const showcase = { title: 'Screen frame', group: 'demo-mfe', summary: 'The root of a demo screen: the theme scope and the column its sections sit in.' } as const;

export default function ScreenFrameShowcase() {
  return (
    <ScreenFrame theme="light">
      <Card>
        <CardContent>
          <Text>The first section of the screen.</Text>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Text>The second section, one gap below.</Text>
        </CardContent>
      </Card>
    </ScreenFrame>
  );
}
