/// <reference types="vite/client" />
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FrontXProvider, apiRegistry, createFrontX, presets, microfrontends, MfeHandlerMF, gtsPlugin, FRONTX_MFE_ENTRY_MF } from '@gears-frontx/react';
import { themeSchema, languageSchema, extensionScreenSchema } from '@gears-frontx/frontx-template-shell';
import { Toaster } from '@gears-frontx/ui-kit';
import { AccountsApiService } from '@/app/api';
// @cpt-dod:cpt-site-dod-shell-layout-navigation-page-frame:p1
// @cpt-algo:cpt-site-algo-shell-layout-navigation-look-and-strings:p1
// @cpt-begin:cpt-site-algo-shell-layout-navigation-look-and-strings:p1:inst-import-styles
import '@gears-frontx/ui-kit/theme.css'; // UI-kit design tokens (imported exactly once, at the app entry)
import './documentEntries'; // Every src/document.css an installed verify package delivers (the brand's tokens and typeface on this site), after the kit's tokens
import './globals.css'; // Document-level styles on the kit's tokens
import '@gears-frontx/ui-kit'; // side-effect: puts ui-kit component CSS in the host document, where MFE shadow roots adopt it (ThemeAwareReactLifecycle).
// @cpt-end:cpt-site-algo-shell-layout-navigation-look-and-strings:p1:inst-import-styles
import '@/app/events/bootstrapEvents'; // Register app-level events (type augmentation)
import { registerBootstrapEffects } from '@/app/effects/bootstrapEffects'; // Register app-level effects
import App from './App';
import { registerNavGroups } from '@/app/layout/navGroups';

import { DEFAULT_THEME_ID, frontxThemes } from '@/app/themes';

// Register application-specific GTS schemas before constructing the FrontX app.
// These derived schemas encode application-level constraints (valid theme names,
// supported languages, screen extension shape) and are not part of the core
// type system in @gears-frontx/gts-plugin.
gtsPlugin.registerSchema(themeSchema);
gtsPlugin.registerSchema(languageSchema);
gtsPlugin.registerSchema(extensionScreenSchema);
// The navigation groups this host defines, which a screen extension names in presentation.group.
registerNavGroups(gtsPlugin);

// Register accounts service (application-level service for user info)
apiRegistry.register(AccountsApiService);

// Initialize API services
apiRegistry.initialize({});

// Create FrontX app instance
// Register MfeHandlerMF to enable Module Federation MFE loading
const app = createFrontX()
  .useAll(presets.full())
  .use(microfrontends({
    typeSystem: gtsPlugin,
    mfeHandlers: [new MfeHandlerMF(FRONTX_MFE_ENTRY_MF)],
  }))
  .build();

// The root registry is built eagerly: the shell is the root runtime, so its
// registry is not tied to any mount window.
void app.mfeRegistry;

// Register app-level effects (pass store dispatch)
registerBootstrapEffects(app.store.dispatch);

// Register the themes (the light one is the default) and apply the default explicitly.
// @cpt-begin:cpt-site-algo-shell-layout-navigation-look-and-strings:p1:inst-apply-default-theme
for (const theme of frontxThemes) app.themeRegistry.register(theme);
app.themeRegistry.apply(DEFAULT_THEME_ID);
// @cpt-end:cpt-site-algo-shell-layout-navigation-look-and-strings:p1:inst-apply-default-theme

/**
 * Render the application. The i18n plugin sets English at init, which loads the registered namespaces (the layout's among them); MfeScreenContainer registers the domains and mounts the screen the address names.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FrontXProvider app={app}>
      <App />
      <Toaster />
    </FrontXProvider>
  </StrictMode>
);

// Dev-only verification hooks. The shell defines only the convention: any
// installed verify package (src-app/verify_packages/*, delivered by
// templates) may ship src/dev-entry.ts - a side-effect module - and the
// shell loads every one it finds in dev. Which checks arrive, if any, is the
// installing template's business; the shell names no template and no
// package. import.meta.glob (not a bare import) because the packages are
// optional: the glob resolves to an empty map when the subtree is absent,
// and a bare specifier would never resolve anyway - native import() rejects
// bare specifiers even when the package is installed. Behind DEV so the
// entries and their dependencies are tree-shaken out of production builds.
// The two console lines keep "none installed" and "installed but broken"
// distinguishable for verification tooling that reads the console.
if (import.meta.env.DEV) {
  const devEntries = import.meta.glob('../verify_packages/*/src/dev-entry.ts');
  const entries = Object.entries(devEntries);
  if (entries.length === 0) {
    console.info('[verify-packages] none installed - no dev-time verification will run.');
  } else {
    for (const [entryPath, loadEntry] of entries) {
      loadEntry().catch((error: unknown) => {
        console.error(`[verify-packages] ${entryPath} is installed but failed to load:`, error);
      });
    }
  }
}
