import { SkeletonCard } from './SkeletonCard';

export const showcase = { title: 'Skeleton card', group: 'demo-mfe', summary: 'A card of placeholder lines while its text loads.' } as const;

export default function SkeletonCardShowcase() {
  return <SkeletonCard busy />;
}
