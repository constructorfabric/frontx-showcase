import { LayoutGridIcon, SquareIcon } from 'lucide-react';
import { NavPanel, NavPanelFoot, NavPanelGroup, NavPanelRow } from './NavPanel';

/** A panel with the Components section open on a component's page. */
export default function NavPanelShowcase() {
  return (
    <NavPanel label="Catalogue">
      <NavPanelGroup id="showcase-components" title="Components">
        <NavPanelRow icon={LayoutGridIcon} label="All components" href="#all" sectionCurrent />
      </NavPanelGroup>
      <NavPanelGroup id="showcase-actions" title="Actions">
        <NavPanelRow icon={SquareIcon} label="Button" href="#button" current />
        <NavPanelRow icon={SquareIcon} label="Toggle" href="#toggle" />
      </NavPanelGroup>
      <NavPanelFoot label="Built with FrontX UI Kit" version="0.4.0" note="Synthetic demo datasets" />
    </NavPanel>
  );
}
