import {
  createDefaultAccountsMockUser,
  replaceCurrentAccountsMockUser,
} from '../api/mock-user-store';
import { createResetAccountsMockState } from '@frontx-test-utils/createResetAccountsMockState';


export const resetAccountsMockState = createResetAccountsMockState(
  createDefaultAccountsMockUser,
  replaceCurrentAccountsMockUser,
);
