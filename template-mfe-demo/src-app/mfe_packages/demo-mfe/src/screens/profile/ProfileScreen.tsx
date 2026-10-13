import React, { useCallback, useRef } from 'react';
import type { ChildMfeBridge } from '@gears-frontx/react';
import {
  FRONTX_SHARED_PROPERTY_THEME,
  FRONTX_SHARED_PROPERTY_LANGUAGE,
  useApiQuery,
  useApiMutation,
  apiRegistry,
} from '@gears-frontx/react';
import { Alert, AlertAction, AlertDescription, Button } from '@gears-frontx/ui-kit';
import { useScreenTranslations } from '../../shared/useScreenTranslations';
import { useBridgeProperty } from '../../shared/useBridgeProperty';
import { useHostDirection } from '../../shared/useHostDirection';
import { AccountsApiService, type UpdateProfileVariables } from '../../api/AccountsApiService';
import type { GetCurrentUserResponse } from '../../api/types';
import { ProfileDetailsCard, type ProfileFormValues } from './components/ProfileDetailsCard';
import { applyOptimisticProfileUpdate } from './profileOptimisticUpdate';
import { BridgeInfoCard } from '../../blocks/BridgeInfoCard';
import { PageHeader } from '../../blocks/PageHeader';
import { ReadingColumn } from '../../blocks/ReadingColumn';
import { ScreenFrame } from '../../blocks/ScreenFrame';
import { ScreenSkeleton } from '../../blocks/ScreenSkeleton';
import { SkeletonCard } from '../../blocks/SkeletonCard';

type UpdateProfileContext = {
  snapshot: GetCurrentUserResponse | undefined;
};

/**
 * Props for the ProfileScreen component.
 */
interface ProfileScreenProps {
  bridge: ChildMfeBridge;
}

// Stable reference for translation modules (hoisted to module level to prevent re-render loops)
const languageModules = import.meta.glob('./i18n/*.json') as Record<
  string,
  () => Promise<{ default: Record<string, string> }>
>;

// @cpt-dod:cpt-template-mfe-demo-dod-mfe-mechanics-demo-data-loading-screen:p1
// @cpt-flow:cpt-template-mfe-demo-flow-mfe-mechanics-demo-edit-profile:p1
// @cpt-algo:cpt-template-mfe-demo-algo-mfe-mechanics-demo-optimistic-update:p1
/**
 * Profile Screen for the MFE remote.
 *
 * Displays user profile information backed by TanStack Query:
 * - Loading state (skeleton placeholders)
 * - Error state (an alert with a Retry action)
 * - Data state (full user profile display + editable profile form)
 *
 * The edit flow demonstrates the full optimistic-update pattern:
 *   onMutate  -> snapshot + optimistic set via queryCache
 *   onError   -> rollback via queryCache.set with snapshot
 *   onSettled -> invalidate to refetch authoritative state
 */
export const ProfileScreen: React.FC<ProfileScreenProps> = ({ bridge }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // @cpt-begin:cpt-template-mfe-demo-flow-mfe-mechanics-demo-edit-profile:p1:inst-read-shared
  const theme = useBridgeProperty(bridge, FRONTX_SHARED_PROPERTY_THEME, 'default');
  const language = useBridgeProperty(bridge, FRONTX_SHARED_PROPERTY_LANGUAGE, 'en');
  useHostDirection(containerRef, language);
  // @cpt-end:cpt-template-mfe-demo-flow-mfe-mechanics-demo-edit-profile:p1:inst-read-shared

  // @cpt-begin:cpt-template-mfe-demo-flow-mfe-mechanics-demo-edit-profile:p1:inst-query-user
  const service = apiRegistry.getService(AccountsApiService);
  // @cpt-end:cpt-template-mfe-demo-flow-mfe-mechanics-demo-edit-profile:p1:inst-query-user

  // @cpt-begin:cpt-template-mfe-demo-flow-mfe-mechanics-demo-edit-profile:p1:inst-load-strings
  // Load translations using the shared hook
  const { t, loading: translationsLoading } = useScreenTranslations(languageModules, bridge);
  // @cpt-end:cpt-template-mfe-demo-flow-mfe-mechanics-demo-edit-profile:p1:inst-load-strings

  // @cpt-begin:cpt-template-mfe-demo-flow-mfe-mechanics-demo-edit-profile:p1:inst-query-user
  // TanStack Query - declarative fetch with automatic AbortSignal threading
  const { data, isLoading, isError, error, refetch } = useApiQuery(
    service.getCurrentUser
  );
  // @cpt-end:cpt-template-mfe-demo-flow-mfe-mechanics-demo-edit-profile:p1:inst-query-user

  // Mutation: update profile name fields with optimistic update + rollback
  const {
    mutateAsync: updateProfile,
    isPending: isUpdating,
    error: updateError,
  } = useApiMutation<GetCurrentUserResponse, Error, UpdateProfileVariables, UpdateProfileContext>({
    endpoint: service.updateProfile,

    // @cpt-begin:cpt-template-mfe-demo-algo-mfe-mechanics-demo-optimistic-update:p1:inst-on-mutate
    onMutate: async (variables, { queryCache }) => {
      // Cancel any in-flight refetch so it doesn't overwrite the optimistic value.
      await queryCache.cancel(service.getCurrentUser);

      const snapshot = queryCache.get<GetCurrentUserResponse>(service.getCurrentUser);

      queryCache.set<GetCurrentUserResponse>(service.getCurrentUser, (old) => {
        return applyOptimisticProfileUpdate(old, variables);
      });

      return { snapshot };
    },
    // @cpt-end:cpt-template-mfe-demo-algo-mfe-mechanics-demo-optimistic-update:p1:inst-on-mutate

    // @cpt-begin:cpt-template-mfe-demo-algo-mfe-mechanics-demo-optimistic-update:p1:inst-on-error
    onError: (_error, _variables, context, { queryCache }) => {
      if (context?.snapshot !== undefined) {
        queryCache.set(service.getCurrentUser, context.snapshot);
      }
    },
    // @cpt-end:cpt-template-mfe-demo-algo-mfe-mechanics-demo-optimistic-update:p1:inst-on-error

    // @cpt-begin:cpt-template-mfe-demo-algo-mfe-mechanics-demo-optimistic-update:p1:inst-on-settled
    onSettled: async (_data, _error, _variables, _context, { queryCache }) => {
      await queryCache.invalidate(service.getCurrentUser);
    },
    // @cpt-end:cpt-template-mfe-demo-algo-mfe-mechanics-demo-optimistic-update:p1:inst-on-settled
  });

  // @cpt-begin:cpt-template-mfe-demo-flow-mfe-mechanics-demo-edit-profile:p1:inst-save
  const handleProfileSave = useCallback(
    async (values: ProfileFormValues) => {
      await updateProfile(values);
    },
    [updateProfile]
  );
  // @cpt-end:cpt-template-mfe-demo-flow-mfe-mechanics-demo-edit-profile:p1:inst-save

  // @cpt-begin:cpt-template-mfe-demo-flow-mfe-mechanics-demo-edit-profile:p1:inst-show-strings-loading
  // Show skeleton loader while translations are loading
  if (translationsLoading) {
    return (
      <ScreenFrame ref={containerRef} theme={theme} busy>
        <ScreenSkeleton />
      </ScreenFrame>
    );
  }
  // @cpt-end:cpt-template-mfe-demo-flow-mfe-mechanics-demo-edit-profile:p1:inst-show-strings-loading

  // @cpt-begin:cpt-template-mfe-demo-flow-mfe-mechanics-demo-edit-profile:p1:inst-show-loading
  // LOADING STATE: Show skeleton placeholders
  if (isLoading) {
    return (
      <ScreenFrame ref={containerRef} theme={theme}>
        <PageHeader title={t('title')} description={t('loading')} />
        <ReadingColumn>
          <SkeletonCard busy />
        </ReadingColumn>
      </ScreenFrame>
    );
  }
  // @cpt-end:cpt-template-mfe-demo-flow-mfe-mechanics-demo-edit-profile:p1:inst-show-loading

  // @cpt-begin:cpt-template-mfe-demo-flow-mfe-mechanics-demo-edit-profile:p1:inst-show-error
  // ERROR STATE: Show the error with a Retry action
  if (isError) {
    return (
      <ScreenFrame ref={containerRef} theme={theme}>
        <PageHeader title={t('title')} />
        <ReadingColumn>
          <Alert variant="destructive">
            <AlertDescription>
              {t('error_prefix')}
              {error?.message ?? 'Unknown error'}
            </AlertDescription>
            <AlertAction>
              <Button size="sm" variant="outline" onClick={() => { refetch(); }}>{t('retry')}</Button>
            </AlertAction>
          </Alert>
        </ReadingColumn>
      </ScreenFrame>
    );
  }
  // @cpt-end:cpt-template-mfe-demo-flow-mfe-mechanics-demo-edit-profile:p1:inst-show-error

  // @cpt-begin:cpt-template-mfe-demo-flow-mfe-mechanics-demo-edit-profile:p1:inst-render-profile
  // DATA STATE: Display full user profile
  const userData = data?.user;

  if (!userData) {
    return null;
  }

  return (
    <ScreenFrame ref={containerRef} theme={theme}>
      <PageHeader title={t('title')} description={t('welcome')} />

      <ReadingColumn>
        <ProfileDetailsCard
          user={userData}
          isSaving={isUpdating}
          saveErrorMessage={updateError?.message}
          t={t}
          onRefresh={() => { refetch(); }}
          onSubmit={handleProfileSave}
        />

        <BridgeInfoCard
          title={t('bridge_info')}
          rows={[
            { label: t('domain_id'), value: bridge.extDomainId },
            { label: t('instance_id'), value: bridge.extensionId },
            { label: t('current_theme'), value: theme },
            { label: t('current_language'), value: language },
          ]}
        />
      </ReadingColumn>
    </ScreenFrame>
  );
  // @cpt-end:cpt-template-mfe-demo-flow-mfe-mechanics-demo-edit-profile:p1:inst-render-profile
};

ProfileScreen.displayName = 'ProfileScreen';
