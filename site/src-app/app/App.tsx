/**
 * FrontX Application Component
 *
 * Renders the Layout with the MFE screen container. FrontXProvider (in main.tsx) supplies the store and the app instance; Layout renders the header, the screen area and the footer; MfeScreenContainer registers the domains and mounts the screen named in the address.
 *
 * The Studio overlay (development controls for the API mode, theme and language) is a development tool: it is loaded in development only and never reaches the production bundle.
 */

import { lazy, Suspense } from 'react';
import { Layout } from '@/app/layout';
import { MfeScreenContainer } from '@/app/mfe/MfeScreenContainer';

// @cpt-begin:cpt-site-algo-shell-layout-navigation-look-and-strings:p1:inst-dev-overlay
const StudioOverlay = import.meta.env.DEV ? lazy(() => import('@gears-frontx/studio').then((module) => ({ default: module.StudioOverlay }))) : null;
// @cpt-end:cpt-site-algo-shell-layout-navigation-look-and-strings:p1:inst-dev-overlay

// @cpt-algo:cpt-site-algo-shell-layout-navigation-look-and-strings:p1
function App() {
  return (
    <>
      <Layout>
        <MfeScreenContainer />
      </Layout>
      {/* @cpt-begin:cpt-site-algo-shell-layout-navigation-look-and-strings:p1:inst-dev-overlay */}
      {StudioOverlay ? (
        <Suspense fallback={null}>
          <StudioOverlay />
        </Suspense>
      ) : null}
      {/* @cpt-end:cpt-site-algo-shell-layout-navigation-look-and-strings:p1:inst-dev-overlay */}
    </>
  );
}

export default App;
