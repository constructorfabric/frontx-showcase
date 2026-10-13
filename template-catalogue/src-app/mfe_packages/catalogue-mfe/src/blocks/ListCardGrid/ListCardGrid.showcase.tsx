import { SquareIcon, TextCursorInputIcon } from 'lucide-react';
import { ListCard, ListCardEntry } from '../ListCard';
import { ListCardGrid } from './ListCardGrid';

/** Two family cards side by side. */
export default function ListCardGridShowcase() {
  return (
    <ListCardGrid label="Components by family">
      <ListCard title="Actions" icon={SquareIcon} count={1}>
        <ListCardEntry label="Button" meta="Preview & code" href="#button" />
      </ListCard>
      <ListCard title="Forms" icon={TextCursorInputIcon} count={1}>
        <ListCardEntry label="Input" meta="Preview & code" href="#input" />
      </ListCard>
    </ListCardGrid>
  );
}
