import type { FrontXApp } from '@gears-frontx/react';
import { ShowPageHandler } from '@site-shared/navigation/openScreen';

/**
 * The templates screen's `show_template` handler: the payload's `template` names a template, whose page is the route of the same name inside the screen.
 * @param app - the templates package's app
 */
export function showTemplateHandler(app: FrontXApp): ShowPageHandler {
  return new ShowPageHandler(app, 'template', (template) => `/${template}`);
}
