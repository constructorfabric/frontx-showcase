import { useEffect, useState, type RefObject } from 'react';

/**
 * Resolved values straight from the cascade, read on an element of the page itself. The page renders inside the screen's shadow root, where the kit's tokens are declared on the shadow host and scoped by the `data-theme` of the screen frame, so the document root carries none of them.
 *
 * Re-read when the theme scope changes (the `data-theme` of the nearest scoped ancestor inside the shadow root and of the shadow host, watched directly: a `theme` prop would race the effect that applies the attribute, since child effects fire first) and on OS scheme flips (the `auto` case).
 *
 * Each page owns its own token list, so a page only re-reads the custom properties it renders.
 * @param tokens - token names without the leading `--`
 * @param anchorRef - an element the page renders, where the values are resolved
 */
export function useTokenValues(tokens: readonly string[], anchorRef: RefObject<Element | null>): Record<string, string> {
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const read = () => {
      const styles = getComputedStyle(anchor);
      const next: Record<string, string> = {};
      for (const token of tokens) {
        next[token] = styles.getPropertyValue(`--${token}`).trim();
      }
      setValues(next);
    };
    read();
    const scheme = window.matchMedia('(prefers-color-scheme: dark)');
    scheme.addEventListener('change', read);
    const observer = new MutationObserver(read);
    const watched = new Set<Element>();
    const scope = anchor.closest('[data-theme]');
    if (scope) watched.add(scope);
    const root = anchor.getRootNode();
    if (root instanceof ShadowRoot) watched.add(root.host);
    else watched.add(document.documentElement);
    for (const element of watched) observer.observe(element, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      scheme.removeEventListener('change', read);
      observer.disconnect();
    };
    // Every call site passes a module-level constant array and a ref, so this
    // runs once per mount in practice; listing both (rather than disabling
    // exhaustive-deps) keeps the hook correct for a computed list.
  }, [tokens, anchorRef]);
  return values;
}
