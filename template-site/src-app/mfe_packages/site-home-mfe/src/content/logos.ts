import acronis from './logos/acronis.svg?inline';
import aracor from './logos/aracor.svg?inline';
import constructorTech from './logos/constructor-tech.svg?inline';
import virtuozzo from './logos/virtuozzo.svg?inline';

/**
 * The logo files of the home page's logo strip, inlined as data URIs into the screen's bundle: a screen package has no public path of its own inside the shell that mounts it, so a file URL would resolve against the shell's origin and miss. The files are the companies' logos as the designer delivered them; the strip shows them in their own colours.
 */
// @cpt-begin:cpt-template-site-algo-home-screen-logo-image:p1:inst-known-logo
const LOGOS: Readonly<Record<string, string>> = {
  'acronis.svg': acronis,
  'aracor.svg': aracor,
  'constructor-tech.svg': constructorTech,
  'virtuozzo.svg': virtuozzo,
};
// @cpt-end:cpt-template-site-algo-home-screen-logo-image:p1:inst-known-logo

/**
 * The image of a logo the home outline names by its file name.
 * @param file - the logo's file name in the outline
 */
// @cpt-algo:cpt-template-site-algo-home-screen-logo-image:p1
export function logoImage(file: string): string | undefined {
  // @cpt-begin:cpt-template-site-algo-home-screen-logo-image:p1:inst-known-logo
  if (Object.prototype.hasOwnProperty.call(LOGOS, file)) return LOGOS[file];
  // @cpt-end:cpt-template-site-algo-home-screen-logo-image:p1:inst-known-logo
  // @cpt-begin:cpt-template-site-algo-home-screen-logo-image:p1:inst-no-logo
  return undefined;
  // @cpt-end:cpt-template-site-algo-home-screen-logo-image:p1:inst-no-logo
}
