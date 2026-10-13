/**
 * The docs data, answered by the service's mock plugin. The site is static and has no backend: the generated data file is the source, bundled with the package, and the plugin serves it at the service's address.
 */
import type { MockMap } from '@gears-frontx/react';
import versions from '../data/versions.generated.json';
import type { GetVersionsResponse } from './types';

// @cpt-flow:cpt-template-site-flow-data-services-answer-query:p1
export const docsMockMap: MockMap = {
  // @cpt-begin:cpt-template-site-flow-data-services-answer-query:p1:inst-answer-from-bundle
  'GET /api/site-docs/versions': (): GetVersionsResponse => ({ vars: versions.vars }),
  // @cpt-end:cpt-template-site-flow-data-services-answer-query:p1:inst-answer-from-bundle
};
