import { SquareIcon } from 'lucide-react';
import { ListCard, ListCardEntry } from './ListCard';

/** A family card with two component rows. */
export default function ListCardShowcase() {
  return (
    <ListCard title="Actions" icon={SquareIcon} count={2} testId="showcase-family">
      <ListCardEntry label="Button" meta="Preview & code" href="#button" />
      <ListCardEntry label="Toggle" description="A two-state button." meta="Preview & code" href="#toggle" />
    </ListCard>
  );
}
