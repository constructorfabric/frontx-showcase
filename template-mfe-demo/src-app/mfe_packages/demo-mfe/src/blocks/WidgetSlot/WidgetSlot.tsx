import { ExtensionDomainSlot, type MfeRegistry } from '@gears-frontx/react';
import styles from './WidgetSlot.module.css';

// @cpt-dod:cpt-template-mfe-demo-dod-screen-entries-screen-blocks:p2
// @cpt-algo:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2
// @cpt-begin:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2:inst-widget-slot
export interface WidgetSlotProps {
  /** The registry of the app that owns the domain. */
  registry: MfeRegistry;
  /** The extension domain whose extensions mount into the slot. */
  domainId: string;
  /** Called once the slot has attached the domain's root. */
  onAttached?: () => void;
}

/*
 * The place an extension domain's widgets mount into, laid out as a column of widgets one small gap apart.
 */
export function WidgetSlot({ registry, domainId, onAttached }: WidgetSlotProps) {
  return <ExtensionDomainSlot registry={registry} domainId={domainId} className={styles.slot} onAttached={onAttached} />;
}
// @cpt-end:cpt-template-mfe-demo-algo-screen-entries-screen-blocks:p2:inst-widget-slot
