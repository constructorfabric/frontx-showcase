/**
 * Screen host theme stamp (GAPS G33).
 *
 * The mount manager never tells a screen's shadow host which appearance the application shows (`DefaultMountManager.setTheme` is a no-op), and every screen re-declares the kit's palette on its host from its shadow root, where the kit's dark fallback follows the operating system. Stamping the active theme's `appearance` as `data-theme` on each host lets the document's own `[data-theme]` rules (the kit's palette and the brand's overrides) match the host from the outer tree, which outranks the host's `:host(...)` rules, so the host and everything a screen renders outside its own themed frame take the site's appearance and brand.
 *
 * The stamp copies no value: it only mirrors the appearance the theme registry already writes on the document element.
 */

import type { ThemeRegistry } from '@gears-frontx/react';

type ThemeSource = Pick<ThemeRegistry, 'getCurrent' | 'subscribe'>;

// @cpt-algo:cpt-site-algo-shell-layout-navigation-host-theme:p1
/**
 * Stamps the current appearance on every child of the slot root that hosts a shadow root, on call, on every child added later and on every theme change.
 * @param root - the screen domain's slot root, as `ExtensionDomainSlot` hands it to `onAttached`
 * @param themes - the application's theme registry
 * @returns a disposer that stops observing the root and the registry
 */
export function stampHostTheme(root: Element, themes: ThemeSource): () => void {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-host-theme:p1:inst-stamp-hosts
  const stamp = (host: Element) => {
    if (!host.shadowRoot) return;
    const appearance = themes.getCurrent()?.appearance;
    if (appearance) host.setAttribute('data-theme', appearance);
    else host.removeAttribute('data-theme');
  };
  const stampAll = () => {
    for (const child of Array.from(root.children)) stamp(child);
  };
  stampAll();
  // @cpt-end:cpt-site-algo-shell-layout-navigation-host-theme:p1:inst-stamp-hosts
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-host-theme:p1:inst-stamp-added
  const observer = new MutationObserver((records) => {
    for (const record of records) for (const node of Array.from(record.addedNodes)) if (node instanceof Element) stamp(node);
  });
  observer.observe(root, { childList: true });
  // @cpt-end:cpt-site-algo-shell-layout-navigation-host-theme:p1:inst-stamp-added
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-host-theme:p1:inst-follow-theme
  const unsubscribe = themes.subscribe(stampAll);
  // @cpt-end:cpt-site-algo-shell-layout-navigation-host-theme:p1:inst-follow-theme
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-host-theme:p1:inst-dispose
  return () => {
    observer.disconnect();
    unsubscribe();
  };
  // @cpt-end:cpt-site-algo-shell-layout-navigation-host-theme:p1:inst-dispose
}
