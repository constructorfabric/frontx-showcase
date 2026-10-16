/**
 * This template's own screens: each screen extension's id and the typed action that shows a page of it, as the packages' `mfe.json` declare them (each package's manifest test holds its entry to these). Content names a screen to open by the same ids; no screen reads a list of the screens the shell registers.
 */

// @cpt-algo:cpt-template-site-algo-site-links-screen-ids:p1
// @cpt-begin:cpt-template-site-algo-site-links-screen-ids:p1:inst-own-screens
/** The screen extension ids of the template's screens. */
export const SITE_SCREEN_EXTENSIONS = {
  home: 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.site_home.screens.home.v1',
  templates: 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.site_templates.screens.templates.v1',
  libs: 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.site_libs.screens.libs.v1',
  docs: 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.site_docs.screens.docs.v1',
} as const;

/** The docs screen's action that shows one guide: payload `{ guide }`, a guide's route without its leading slash. */
export const SHOW_GUIDE_ACTION = 'gts.frontx.mfes.comm.action.v1~frontx.site_docs.nav.show_guide.v1~';

/** The templates screen's action that shows one template's page: payload `{ template }`, the template's route without its leading slash. */
export const SHOW_TEMPLATE_ACTION = 'gts.frontx.mfes.comm.action.v1~frontx.site_templates.nav.show_template.v1~';
// @cpt-end:cpt-template-site-algo-site-links-screen-ids:p1:inst-own-screens

// @cpt-begin:cpt-template-site-algo-site-links-screen-ids:p1:inst-catalogue-screen
/** The catalogue screen of template-catalogue, which the libs screen's UI kit card, the docs overview and the home page open: the extension id its `mfe.json` declares. */
export const CATALOGUE_SCREEN_EXTENSION = 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.catalogue.screens.catalogue.v1';

/** The catalogue's action that shows one component's page: payload `{ component }`, the component's slug, as template-catalogue's manifest declares it. The home page's UI kit tiles send it. */
export const SHOW_COMPONENT_ACTION = 'gts.frontx.mfes.comm.action.v1~frontx.catalogue.nav.show_component.v1~';
// @cpt-end:cpt-template-site-algo-site-links-screen-ids:p1:inst-catalogue-screen
