import type { MfeRegistry } from '@gears-frontx/react';
import { WidgetSlot } from './WidgetSlot';

export const showcase = { title: 'Widget slot', group: 'demo-mfe', summary: 'The column an extension domain mounts its widgets into.' } as const;

/** A registry whose domain has no extensions and a mounter that does nothing: the slot renders empty, as before its domain's first mount. */
const emptyRegistry = {
  getExtensionsForDomain: () => [],
  getMounter: () => ({ attach: () => undefined, detach: () => undefined }),
} as unknown as MfeRegistry;

export default function WidgetSlotShowcase() {
  return <WidgetSlot registry={emptyRegistry} domainId="gts.frontx.mfes.ext.domain.v1~frontx.widgets.area.main.v1" />;
}
