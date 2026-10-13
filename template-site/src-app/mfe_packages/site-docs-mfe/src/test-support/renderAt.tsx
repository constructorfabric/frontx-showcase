import { render } from '@testing-library/react';
import { FRONTX_SHARED_PROPERTY_LANGUAGE } from '@gears-frontx/react';
import { resolveNavigationHistory } from '@gears-frontx/routing';
import { adaptProviderHistory, EngineProvider } from '@gears-frontx/routing-tanstack';
import { createMfeBridgeFixture } from '@frontx-test-utils/createMfeBridgeFixture';
import { docsRouteTree } from '../routes';
import { ScreenFrame } from '../shared/ScreenFrame';

/** The docs screen's extension, as its tests name it. */
export const DOCS_EXTENSION_ID = 'ext.docs';

/**
 * Renders the docs route tree at a page address, as a standalone mount reads it, inside the screen frame with an English bridge.
 * @param pathname - the path inside the screen
 */
export function renderDocsAt(pathname: string) {
  window.history.replaceState(null, '', pathname);
  const fixture = createMfeBridgeFixture({
    extDomainId: 'gts.frontx.mfes.ext.domain.v1~frontx.screensets.layout.screen.v1',
    extensionId: DOCS_EXTENSION_ID,
    initialProperties: { [FRONTX_SHARED_PROPERTY_LANGUAGE]: 'en' },
  });
  const history = adaptProviderHistory(resolveNavigationHistory(), undefined);
  const result = render(
    <ScreenFrame bridge={fixture.bridge} languages={['en']}>
      <EngineProvider routeTree={docsRouteTree} history={history} />
    </ScreenFrame>
  );
  return { ...result, bridge: fixture.bridge };
}
