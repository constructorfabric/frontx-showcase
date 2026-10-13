import { ScreenFrame } from '../ScreenFrame';
import { ScreenSkeleton } from './ScreenSkeleton';

export const showcase = { title: 'Screen skeleton', group: 'demo-mfe', summary: 'The placeholder of a whole screen while its strings load.' } as const;

export default function ScreenSkeletonShowcase() {
  return (
    <ScreenFrame theme="light" busy>
      <ScreenSkeleton />
    </ScreenFrame>
  );
}
