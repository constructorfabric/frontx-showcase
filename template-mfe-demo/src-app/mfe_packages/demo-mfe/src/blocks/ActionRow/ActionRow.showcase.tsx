import { Button } from '@gears-frontx/ui-kit';
import { ActionRow } from './ActionRow';

export const showcase = { title: 'Action row', group: 'demo-mfe', summary: 'A wrapping row of actions.' } as const;

export default function ActionRowShowcase() {
  return (
    <ActionRow>
      <Button>Go to Theme Screen</Button>
      <Button variant="outline">Open Profile and refresh it</Button>
      <Button variant="outline">Mount Widgets Host and ping alpha</Button>
    </ActionRow>
  );
}
