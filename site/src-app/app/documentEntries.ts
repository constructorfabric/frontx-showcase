/// <reference types="vite/client" />
/**
 * Document stylesheets delivered by templates. The shell defines only the convention, the production sibling of the dev-entry one in `main.tsx`: any installed verify package (`src-app/verify_packages/*`, delivered by a template) may ship `src/document.css`, and the shell loads every one it finds into the document, where every screen's shadow root adopts it with the other head styles. Which styles arrive, if any, is the installing template's business; the shell names no template and no package, and a project without such a package loads nothing.
 *
 * A module of its own, imported between the kit's tokens and the document styles in `main.tsx`, because Vite hoists an eager glob's imports to the top of the importing module: here they keep their place in the entry's import order.
 */

// @cpt-begin:cpt-site-algo-shell-layout-navigation-look-and-strings:p1:inst-document-entries
import.meta.glob('../verify_packages/*/src/document.css', { eager: true });
// @cpt-end:cpt-site-algo-shell-layout-navigation-look-and-strings:p1:inst-document-entries
