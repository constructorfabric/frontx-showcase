import { Card, CardContent } from '@gears-frontx/ui-kit';
import { Text } from '@gears-frontx/kit-candidates';
import { ReadingColumn } from './ReadingColumn';

export const showcase = { title: 'Reading column', group: 'demo-mfe', summary: 'A column of cards held to a reading width.' } as const;

export default function ReadingColumnShowcase() {
  return (
    <ReadingColumn>
      <Card>
        <CardContent>
          <Text>A profile card.</Text>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Text>The bridge information under it.</Text>
        </CardContent>
      </Card>
    </ReadingColumn>
  );
}
