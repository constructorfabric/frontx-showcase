import React, { createElement, useRef } from 'react';
import type { ChildMfeBridge } from '@gears-frontx/react';
import { FRONTX_SHARED_PROPERTY_THEME, FRONTX_SHARED_PROPERTY_LANGUAGE } from '@gears-frontx/react';
import { CardContent, CardHeader } from '@gears-frontx/ui-kit';
import { Card, CardTitle, DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from '@gears-frontx/kit-candidates';
import { useScreenTranslations } from '../../shared/useScreenTranslations';
import { useBridgeProperty } from '../../shared/useBridgeProperty';
import { useHostDirection } from '../../shared/useHostDirection';
import { BridgeInfoCard } from '../../blocks/BridgeInfoCard';
import { PageHeader } from '../../blocks/PageHeader';
import { ReadingColumn } from '../../blocks/ReadingColumn';
import { ScreenFrame } from '../../blocks/ScreenFrame';
import { ScreenSkeleton } from '../../blocks/ScreenSkeleton';
import { SwatchGrid, type Swatch } from '../../blocks/SwatchGrid';
import { TokenList } from '../../blocks/TokenList';

/*
 * The swatches paint from the token names the screen renders with: its frame scopes the kit's tokens to the shell's theme, and the overrides the host document's stylesheets carry into the shadow root (in the site, the brand) apply on top, so each swatch shows the palette every kit component of the page is drawn in.
 */

/** The token names the screen lists, the seven pairs the swatches paint. */
const TOKEN_NAMES = [
  '--background',
  '--foreground',
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--destructive',
  '--destructive-foreground',
] as const;

/**
 * Props for the CurrentThemeScreen component.
 */
interface CurrentThemeScreenProps {
  bridge: ChildMfeBridge;
}

// Stable reference for translation modules (hoisted to module level to prevent re-render loops)
const languageModules = import.meta.glob('./i18n/*.json') as Record<
  string,
  () => Promise<{ default: Record<string, string> }>
>;

// @cpt-dod:cpt-template-mfe-demo-dod-mfe-mechanics-demo-shared-state-screen:p1
// @cpt-flow:cpt-template-mfe-demo-flow-mfe-mechanics-demo-view-shared-state:p1
/**
 * Current Theme Screen for the MFE remote.
 *
 * Displays the current theme value and demonstrates CSS variable consumption.
 * Shows colored swatches for background, foreground, primary, secondary, muted, accent,
 * destructive using the CSS custom properties.
 *
 * Receives a ChildMfeBridge for communication with the host application.
 * Demonstrates bridge usage by displaying extDomainId, extensionId, theme, and language.
 *
 * Runs inside Shadow DOM with isolated styles.
 *
 * Subscribes to theme and language domain properties to demonstrate
 * host-MFE communication via bridge.
 */
export const CurrentThemeScreen: React.FC<CurrentThemeScreenProps> = ({ bridge }) => {
  // @cpt-begin:cpt-template-mfe-demo-flow-mfe-mechanics-demo-view-shared-state:p1:inst-read-shared
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useBridgeProperty(bridge, FRONTX_SHARED_PROPERTY_THEME, 'default');
  const language = useBridgeProperty(bridge, FRONTX_SHARED_PROPERTY_LANGUAGE, 'en');
  useHostDirection(containerRef, language);
  // @cpt-end:cpt-template-mfe-demo-flow-mfe-mechanics-demo-view-shared-state:p1:inst-read-shared

  // @cpt-begin:cpt-template-mfe-demo-flow-mfe-mechanics-demo-view-shared-state:p1:inst-load-strings
  // Load translations using the shared hook
  const { t, loading } = useScreenTranslations(languageModules, bridge);
  // @cpt-end:cpt-template-mfe-demo-flow-mfe-mechanics-demo-view-shared-state:p1:inst-load-strings

  // @cpt-begin:cpt-template-mfe-demo-flow-mfe-mechanics-demo-view-shared-state:p1:inst-define-swatches
  // Color swatches data (names are translated when the page renders)
  const colorSwatches: ReadonlyArray<{ token: Swatch['token']; nameKey: string }> = [
    { token: 'background', nameKey: 'color_background' },
    { token: 'foreground', nameKey: 'color_foreground' },
    { token: 'primary', nameKey: 'color_primary' },
    { token: 'secondary', nameKey: 'color_secondary' },
    { token: 'muted', nameKey: 'color_muted' },
    { token: 'accent', nameKey: 'color_accent' },
    { token: 'destructive', nameKey: 'color_destructive' },
  ];
  // @cpt-end:cpt-template-mfe-demo-flow-mfe-mechanics-demo-view-shared-state:p1:inst-define-swatches

  // @cpt-begin:cpt-template-mfe-demo-flow-mfe-mechanics-demo-view-shared-state:p1:inst-show-loading
  // Show skeleton while translations are loading
  if (loading) {
    return (
      <ScreenFrame ref={containerRef} theme={theme} busy>
        <ScreenSkeleton />
      </ScreenFrame>
    );
  }
  // @cpt-end:cpt-template-mfe-demo-flow-mfe-mechanics-demo-view-shared-state:p1:inst-show-loading

  // @cpt-begin:cpt-template-mfe-demo-flow-mfe-mechanics-demo-view-shared-state:p1:inst-render-page
  return (
    <ScreenFrame ref={containerRef} theme={theme}>
      <PageHeader title={t('title')} description={t('description')} />

      <ReadingColumn>
        <Card>
          <CardHeader>
            <CardTitle render={createElement('h2')}>{t('theme_information')}</CardTitle>
          </CardHeader>
          <CardContent>
            <DescriptionList>
              <DescriptionItem>
                <DescriptionTerm>{t('current_theme_label')}:</DescriptionTerm>
                <DescriptionDetails variant="mono">{theme}</DescriptionDetails>
              </DescriptionItem>
            </DescriptionList>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle render={createElement('h2')}>{t('theme_color_swatches')}</CardTitle>
          </CardHeader>
          <CardContent>
            <SwatchGrid swatches={colorSwatches.map(({ token, nameKey }) => ({ token, name: t(nameKey) }))} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle render={createElement('h2')}>{t('css_custom_properties')}</CardTitle>
          </CardHeader>
          <CardContent>
            <TokenList tokens={TOKEN_NAMES} />
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
      </ReadingColumn>
    </ScreenFrame>
  );
  // @cpt-end:cpt-template-mfe-demo-flow-mfe-mechanics-demo-view-shared-state:p1:inst-render-page
};

CurrentThemeScreen.displayName = 'CurrentThemeScreen';
