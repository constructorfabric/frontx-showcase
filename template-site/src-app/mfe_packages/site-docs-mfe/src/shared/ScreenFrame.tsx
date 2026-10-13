import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { FRONTX_SHARED_PROPERTY_LANGUAGE, FRONTX_SHARED_PROPERTY_THEME, type ChildMfeBridge } from '@gears-frontx/react';
import { kitThemeScopeFor } from '@site-shared/theme/kitThemeScope';

const RTL_LANGUAGES = new Set(['ar', 'he', 'fa', 'ur']);

const BridgeContext = createContext<ChildMfeBridge | null>(null);

// @cpt-flow:cpt-template-site-flow-screen-frame-follow-host:p2
// @cpt-dod:cpt-template-site-dod-screen-frame-theme-language:p2
/** The bridge of the mounted screen, for route components. */
export function useBridge(): ChildMfeBridge {
  // @cpt-begin:cpt-template-site-flow-screen-frame-follow-host:p1:inst-bridge-context
  const bridge = useContext(BridgeContext);
  if (!bridge) throw new Error('useBridge must be used inside ScreenFrame');
  return bridge;
  // @cpt-end:cpt-template-site-flow-screen-frame-follow-host:p1:inst-bridge-context
}

/**
 * The current value of a shared property, kept in sync with the host.
 * @param bridge - the screen's bridge
 * @param property - the shared property id
 * @param fallback - used while the host has broadcast no string value
 */
export function useBridgeProperty(bridge: ChildMfeBridge, property: string, fallback: string): string {
  // @cpt-begin:cpt-template-site-flow-screen-frame-follow-host:p1:inst-read-shared-properties
  const read = () => {
    const current = bridge.getProperty(property);
    return current && typeof current.value === 'string' ? current.value : fallback;
  };
  const [value, setValue] = useState(read);
  const [prevBridge, setPrevBridge] = useState(bridge);
  if (prevBridge !== bridge) {
    setPrevBridge(bridge);
    setValue(read());
  }
  useEffect(
    () =>
      bridge.subscribeToProperty(property, (next) => {
        if (typeof next.value === 'string') setValue(next.value);
      }),
    [bridge, property]
  );
  return value;
  // @cpt-end:cpt-template-site-flow-screen-frame-follow-host:p1:inst-read-shared-properties
}

// @cpt-algo:cpt-template-site-algo-screen-frame-content-language:p2
/** Direction of a language code, by its primary subtag. */
export function directionFor(language: string): 'ltr' | 'rtl' {
  // @cpt-begin:cpt-template-site-algo-screen-frame-content-language:p1:inst-direction
  return RTL_LANGUAGES.has(language.split('-')[0]?.toLowerCase() ?? '') ? 'rtl' : 'ltr';
  // @cpt-end:cpt-template-site-algo-screen-frame-content-language:p1:inst-direction
}

/** The source language every screen ships; a language the screen has no strings for renders in it. */
export const SOURCE_LANGUAGE = 'en';

/**
 * The languages a screen ships strings for, from the paths of its locale files (`./screens/home/i18n/en.json` gives `en`).
 * @param localePaths - the keys of the screen's `import.meta.glob` over its locale files
 */
export function shippedLanguages(localePaths: readonly string[]): string[] {
  // @cpt-begin:cpt-template-site-algo-screen-frame-content-language:p1:inst-shipped-languages
  return [...new Set(localePaths.map((file) => /\/i18n\/([^/]+)\.json$/.exec(file)?.[1]).filter((language): language is string => language !== undefined))];
  // @cpt-end:cpt-template-site-algo-screen-frame-content-language:p1:inst-shipped-languages
}

/**
 * The language the screen's text is actually in: the shell's language when the screen ships it, otherwise the source language. The shadow host declares this language and its direction, so English text under a right-to-left shell language keeps its left-to-right layout.
 * @param requested - the shell's language shared property
 * @param shipped - the languages the screen ships
 */
export function contentLanguage(requested: string, shipped: readonly string[]): string {
  // @cpt-begin:cpt-template-site-algo-screen-frame-content-language:p1:inst-pick-language
  return shipped.includes(requested) ? requested : SOURCE_LANGUAGE;
  // @cpt-end:cpt-template-site-algo-screen-frame-content-language:p1:inst-pick-language
}

/**
 * Everything the screen needs around its routes inside the shadow root: the kit's token scope from the shell's theme (`data-theme`), the language and direction of the text the screen renders (on the frame and on the shadow host, never on the document), and the bridge for route components.
 */
export function ScreenFrame({ bridge, languages, children }: { bridge: ChildMfeBridge; languages: readonly string[]; children: ReactNode }) {
  // @cpt-begin:cpt-template-site-flow-screen-frame-follow-host:p1:inst-read-shared-properties
  const theme = useBridgeProperty(bridge, FRONTX_SHARED_PROPERTY_THEME, 'light');
  const requested = useBridgeProperty(bridge, FRONTX_SHARED_PROPERTY_LANGUAGE, SOURCE_LANGUAGE);
  // @cpt-end:cpt-template-site-flow-screen-frame-follow-host:p1:inst-read-shared-properties
  const frameRef = useRef<HTMLDivElement>(null);
  // @cpt-begin:cpt-template-site-flow-screen-frame-follow-host:p1:inst-resolve-language
  const lang = contentLanguage(requested, languages);
  const dir = directionFor(lang);
  // @cpt-end:cpt-template-site-flow-screen-frame-follow-host:p1:inst-resolve-language

  // @cpt-begin:cpt-template-site-flow-screen-frame-follow-host:p1:inst-declare-on-host
  useEffect(() => {
    const rootNode = frameRef.current?.getRootNode();
    if (rootNode instanceof ShadowRoot && rootNode.host instanceof HTMLElement) {
      rootNode.host.lang = lang;
      rootNode.host.dir = dir;
    }
  }, [lang, dir]);
  // @cpt-end:cpt-template-site-flow-screen-frame-follow-host:p1:inst-declare-on-host

  // @cpt-begin:cpt-template-site-flow-screen-frame-follow-host:p1:inst-render-frame
  return (
    <div ref={frameRef} data-theme={kitThemeScopeFor(theme)} lang={lang} dir={dir} data-testid="screen-root">
      <BridgeContext.Provider value={bridge}>{children}</BridgeContext.Provider>
    </div>
  );
  // @cpt-end:cpt-template-site-flow-screen-frame-follow-host:p1:inst-render-frame
}
