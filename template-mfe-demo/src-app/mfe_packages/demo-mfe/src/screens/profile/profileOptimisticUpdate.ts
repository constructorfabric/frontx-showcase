import type { UpdateProfileVariables } from '../../api/AccountsApiService';
import type { GetCurrentUserResponse } from '../../api/types';

// @cpt-dod:cpt-template-mfe-demo-dod-mfe-mechanics-demo-data-loading-screen:p1
// @cpt-algo:cpt-template-mfe-demo-algo-mfe-mechanics-demo-optimistic-update:p1
// @cpt-begin:cpt-template-mfe-demo-algo-mfe-mechanics-demo-optimistic-update:p1:inst-apply-patch
export function applyOptimisticProfileUpdate(
  current: GetCurrentUserResponse | undefined,
  variables: UpdateProfileVariables,
  updatedAt: string = new Date().toISOString()
): GetCurrentUserResponse | undefined {
  if (!current) {
    return current;
  }

  return {
    user: {
      ...current.user,
      firstName: variables.firstName,
      lastName: variables.lastName,
      updatedAt,
      extra: {
        ...current.user.extra,
        department: variables.department,
      },
    },
  };
}
// @cpt-end:cpt-template-mfe-demo-algo-mfe-mechanics-demo-optimistic-update:p1:inst-apply-patch
