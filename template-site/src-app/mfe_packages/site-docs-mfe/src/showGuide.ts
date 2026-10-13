import type { FrontXApp } from '@gears-frontx/react';
import { ShowPageHandler } from '@site-shared/navigation/openScreen';

/**
 * The docs screen's `show_guide` handler: the payload's `guide` names a guide, whose page is the route of the same name inside the screen. The lifecycle registers it, and the chain test drives the same binding.
 * @param app - the docs package's app
 */
export function showGuideHandler(app: FrontXApp): ShowPageHandler {
  return new ShowPageHandler(app, 'guide', (guide) => `/${guide}`);
}
