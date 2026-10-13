/**
 * The libs data, answered by the service's mock plugin. The site is static and has no backend: the generated data file is the source, bundled with the package, and the plugin serves it at the service's address.
 */
import type { MockMap } from '@gears-frontx/react';
import libraries from '../data/libraries.generated.json';
import type { GetLibrariesResponse } from './types';

// @cpt-flow:cpt-template-site-flow-data-services-answer-query:p1
export const libsMockMap: MockMap = {
  // @cpt-begin:cpt-template-site-flow-data-services-answer-query:p1:inst-answer-from-bundle
  'GET /api/site-libs/libraries': (): GetLibrariesResponse => ({ vars: libraries.vars, libraries: libraries.libraries, shellPackages: libraries.shellPackages }),
  // @cpt-end:cpt-template-site-flow-data-services-answer-query:p1:inst-answer-from-bundle
};
