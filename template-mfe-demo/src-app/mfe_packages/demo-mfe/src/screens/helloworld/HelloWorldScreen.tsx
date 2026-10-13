import React, { createElement, useCallback, useRef } from 'react';
import type { ChildMfeBridge } from '@gears-frontx/react';
import { FRONTX_ACTION_MOUNT_EXT, FRONTX_SCREEN_DOMAIN, FRONTX_SHARED_PROPERTY_THEME, FRONTX_SHARED_PROPERTY_LANGUAGE } from '@gears-frontx/react';
import { Button, Card, CardContent, CardFooter, CardHeader } from '@gears-frontx/ui-kit';
import { CardTitle, Text } from '@gears-frontx/kit-candidates';
import { useScreenTranslations } from '../../shared/useScreenTranslations';
import { useBridgeProperty } from '../../shared/useBridgeProperty';
import { useHostDirection } from '../../shared/useHostDirection';
import {
  THEME_EXTENSION_ID,
  PROFILE_EXTENSION_ID,
  DEMO_ACTION_REFRESH_PROFILE,
  WIDGETS_HOST_EXTENSION_ID,
  WIDGETS_DOMAIN_ID,
  WIDGET_ALPHA_EXTENSION_ID,
  WIDGET_PING_ACTION_TYPE,
} from '../../shared/extension-ids';
import { ActionRow } from '../../blocks/ActionRow';
import { BridgeInfoCard } from '../../blocks/BridgeInfoCard';
import { PageHeader } from '../../blocks/PageHeader';
import { ScreenFrame } from '../../blocks/ScreenFrame';
import { ScreenSkeleton } from '../../blocks/ScreenSkeleton';

/**
 * Props for the HelloWorldScreen component.
 */
interface HelloWorldScreenProps {
  bridge: ChildMfeBridge;
}

// Stable reference for translation modules (hoisted to module level to prevent re-render loops)
const languageModules = import.meta.glob('./i18n/*.json') as Record<
  string,
  () => Promise<{ default: Record<string, string> }>
>;

// @cpt-dod:cpt-template-mfe-demo-dod-mfe-mechanics-demo-isolation-screen:p1
// @cpt-flow:cpt-template-mfe-demo-flow-mfe-mechanics-demo-explore-isolation:p1
/**
 * Hello World Screen for the MFE remote.
 *
 * Demonstrates MFE capabilities including:
 * - Shadow DOM isolation
 * - Bridge communication
 * - Theme property subscription
 * - Language property subscription
 * - MFE-local i18n with dynamic translation loading
 * - Cross-screen navigation via actions chains
 *
 * Built from the package's blocks, @gears-frontx/ui-kit components and the
 * kit candidates; the screen itself carries no stylesheet. Runs inside
 * Shadow DOM with isolated styles.
 */
export const HelloWorldScreen: React.FC<HelloWorldScreenProps> = ({ bridge }) => {
  // @cpt-begin:cpt-template-mfe-demo-flow-mfe-mechanics-demo-explore-isolation:p1:inst-read-shared
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useBridgeProperty(bridge, FRONTX_SHARED_PROPERTY_THEME, 'default');
  const language = useBridgeProperty(bridge, FRONTX_SHARED_PROPERTY_LANGUAGE, 'en');
  useHostDirection(containerRef, language);
  // @cpt-end:cpt-template-mfe-demo-flow-mfe-mechanics-demo-explore-isolation:p1:inst-read-shared

  // @cpt-begin:cpt-template-mfe-demo-flow-mfe-mechanics-demo-explore-isolation:p1:inst-load-strings
  // Load translations using the shared hook
  const { t, loading } = useScreenTranslations(languageModules, bridge);
  // @cpt-end:cpt-template-mfe-demo-flow-mfe-mechanics-demo-explore-isolation:p1:inst-load-strings

  // @cpt-begin:cpt-template-mfe-demo-flow-mfe-mechanics-demo-explore-isolation:p1:inst-open-theme
  // Navigate to Theme Screen. Dispatch is acceptance-only: it returns void
  // and never throws, so there is nothing to await or catch here.
  const handleGoToTheme = useCallback(() => {
    bridge.executeActionsChain({
      action: {
        type: FRONTX_ACTION_MOUNT_EXT,
        target: FRONTX_SCREEN_DOMAIN,
        payload: { subject: THEME_EXTENSION_ID },
      },
    });
  }, [bridge]);
  // @cpt-end:cpt-template-mfe-demo-flow-mfe-mechanics-demo-explore-isolation:p1:inst-open-theme

  // @cpt-begin:cpt-template-mfe-demo-flow-mfe-mechanics-demo-explore-isolation:p1:inst-open-profile-refresh
  // Mount Profile then - on success - send a refresh action to the now-mounted
  // Profile extension. The chained `next` step targets the extension ID directly
  // so the mediator routes it to Profile's registered ActionHandler rather than
  // through the domain's lifecycle action pipeline.
  const handleOpenProfileAndRefresh = useCallback(() => {
    bridge.executeActionsChain({
      action: {
        type: FRONTX_ACTION_MOUNT_EXT,
        target: FRONTX_SCREEN_DOMAIN,
        payload: { subject: PROFILE_EXTENSION_ID },
      },
      next: {
        action: {
          type: DEMO_ACTION_REFRESH_PROFILE,
          target: PROFILE_EXTENSION_ID,
        },
      },
    });
  }, [bridge]);
  // @cpt-end:cpt-template-mfe-demo-flow-mfe-mechanics-demo-explore-isolation:p1:inst-open-profile-refresh

  // @cpt-begin:cpt-template-mfe-demo-flow-mfe-mechanics-demo-explore-isolation:p1:inst-ping-widget
  // Mount Widgets Host into the shell's screen domain, then - on success -
  // mount widget-a's alpha instance into the widgets domain Widgets Host owns,
  // then - on success - ping that alpha instance. A single action chain, fully
  // defined at creation time via `next` continuations, dispatched in one
  // `executeActionsChain` call. Mounting Widgets Host evicts Hello World itself
  // from the shell's screen domain (`ExclusiveMountStrategy`), but the chain
  // keeps executing in the mediator, as a recursive continuation, regardless
  // of what happens to the sender afterward - this exercises cross-nesting
  // delivery two hops away from the shell (shell -> Widgets Host -> widgets
  // domain -> widget-a). Widgets Host auto-mounts all extensions including
  // alpha, so this mount_ext lands on an already-mounted or in-progress alpha
  // and resolves successfully.
  const handlePingWidgetA = useCallback(() => {
    bridge.executeActionsChain({
      action: {
        type: FRONTX_ACTION_MOUNT_EXT,
        target: FRONTX_SCREEN_DOMAIN,
        payload: { subject: WIDGETS_HOST_EXTENSION_ID },
      },
      next: {
        action: {
          type: FRONTX_ACTION_MOUNT_EXT,
          target: WIDGETS_DOMAIN_ID,
          payload: { subject: WIDGET_ALPHA_EXTENSION_ID },
        },
        next: {
          action: {
            type: WIDGET_PING_ACTION_TYPE,
            target: WIDGET_ALPHA_EXTENSION_ID,
            payload: {},
          },
        },
      },
    });
  }, [bridge]);
  // @cpt-end:cpt-template-mfe-demo-flow-mfe-mechanics-demo-explore-isolation:p1:inst-ping-widget

  // @cpt-begin:cpt-template-mfe-demo-flow-mfe-mechanics-demo-explore-isolation:p1:inst-show-loading
  // Show skeleton while translations are loading
  if (loading) {
    return (
      <ScreenFrame ref={containerRef} theme={theme} busy>
        <ScreenSkeleton />
      </ScreenFrame>
    );
  }
  // @cpt-end:cpt-template-mfe-demo-flow-mfe-mechanics-demo-explore-isolation:p1:inst-show-loading

  // @cpt-begin:cpt-template-mfe-demo-flow-mfe-mechanics-demo-explore-isolation:p1:inst-render-page
  return (
    <ScreenFrame ref={containerRef} theme={theme}>
      <PageHeader title={t('title')} description={t('welcome')} />

      <Card>
        <CardContent>
          <Text tone="muted">{t('description')}</Text>
        </CardContent>
      </Card>

      <BridgeInfoCard
        title={t('bridge_info')}
        rows={[
          { label: t('domain_id'), value: bridge.extDomainId },
          { label: t('instance_id'), value: bridge.extensionId },
          { label: t('current_theme'), value: theme },
          { label: t('current_language'), value: language },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle render={createElement('h2')}>{t('navigation_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Text tone="muted">{t('navigation_description')}</Text>
        </CardContent>
        <CardFooter>
          <ActionRow>
            <Button onClick={handleGoToTheme}>{t('go_to_theme')}</Button>
            <Button onClick={handleOpenProfileAndRefresh} variant="outline">
              {t('open_profile_refresh')}
            </Button>
            <Button
              onClick={handlePingWidgetA}
              variant="outline"
              data-testid="hello-world-ping-widget-a"
            >
              {t('mount_widgets_host_and_ping')}
            </Button>
          </ActionRow>
        </CardFooter>
      </Card>
    </ScreenFrame>
  );
  // @cpt-end:cpt-template-mfe-demo-flow-mfe-mechanics-demo-explore-isolation:p1:inst-render-page
};

HelloWorldScreen.displayName = 'HelloWorldScreen';
