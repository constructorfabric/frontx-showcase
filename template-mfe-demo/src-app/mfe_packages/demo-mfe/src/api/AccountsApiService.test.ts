import { AccountsApiService } from './AccountsApiService';
import { resetAccountsMockState } from '../test-support/mocks';
import { UserRole } from './types';
import { describeAccountsApiServiceContract } from '@frontx-test-utils/describeAccountsApiServiceContract';

describeAccountsApiServiceContract({
  suiteName: 'AccountsApiService',
  createService: () => new AccountsApiService(),
  resetAccountsMockState,
  adminRole: UserRole.Admin,
});
