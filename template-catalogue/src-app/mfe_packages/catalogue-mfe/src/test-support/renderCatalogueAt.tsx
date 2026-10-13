import { render } from '@testing-library/react';
import { FRONTX_SHARED_PROPERTY_LANGUAGE, FRONTX_SHARED_PROPERTY_THEME } from '@gears-frontx/react';
import { resolveNavigationHistory } from '@gears-frontx/routing';
import { adaptProviderHistory, EngineProvider } from '@gears-frontx/routing-tanstack';
import { createMfeBridgeFixture } from '@frontx-test-utils/createMfeBridgeFixture';
import { catalogueRouteTree } from '../routes';
import { ScreenFrame } from '../frame/ScreenFrame';
import { CatalogueTextProvider } from '../screens/catalogue/CatalogueText';

/** Renders the catalogue's route tree at a path, over the page address (the standalone mode of the screen's router); returns the render and the bridge's recorded action chains. */
export function renderCatalogueAt(pathname: string) {
  window.history.replaceState(null, '', pathname);
  const { bridge, executeActionsChain } = createMfeBridgeFixture({
    extDomainId: 'gts.frontx.mfes.ext.domain.v1~frontx.screensets.layout.screen.v1',
    extensionId: 'ext.catalogue',
    initialProperties: { [FRONTX_SHARED_PROPERTY_LANGUAGE]: 'en', [FRONTX_SHARED_PROPERTY_THEME]: 'light' },
  });
  const rendered = render(
    <ScreenFrame bridge={bridge}>
      <CatalogueTextProvider>
        <EngineProvider routeTree={catalogueRouteTree} history={adaptProviderHistory(resolveNavigationHistory(), undefined)} />
      </CatalogueTextProvider>
    </ScreenFrame>
  );
  return { ...rendered, executeActionsChain };
}
