import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { FRONTX_SHARED_PROPERTY_LANGUAGE, FRONTX_SHARED_PROPERTY_THEME, type ChildMfeBridge } from '@gears-frontx/react';
import { kitThemeScopeFor } from './kitThemeScope';

const RTL_LANGUAGES = new Set(['ar', 'he', 'fa', 'ur']);

const BridgeContext = createContext<ChildMfeBridge | null>(null);

/** The bridge of the mounted screen, for route components. */
export function useBridge(): ChildMfeBridge {
  const bridge = useContext(BridgeContext);
  if (!bridge) throw new Error('useBridge must be used inside ScreenFrame');
  return bridge;
}

/**
 * The current value of a shared property, kept in sync with the host.
 * @param bridge - the screen's bridge
 * @param property - the shared property id
 * @param fallback - used while the host has broadcast no string value
 */
// @cpt-algo:cpt-template-catalogue-algo-catalogue-screen-host-theme:p1
export function useBridgeProperty(bridge: ChildMfeBridge, property: string, fallback: string): string {
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-host-theme:p1:inst-read-property
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
  // @cpt-end:cpt-template-catalogue-algo-catalogue-screen-host-theme:p1:inst-read-property
  return value;
}

/** Direction of a language code, by its primary subtag. */
export function directionFor(language: string): 'ltr' | 'rtl' {
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-host-theme:p1:inst-set-direction
  return RTL_LANGUAGES.has(language.split('-')[0]?.toLowerCase() ?? '') ? 'rtl' : 'ltr';
  // @cpt-end:cpt-template-catalogue-algo-catalogue-screen-host-theme:p1:inst-set-direction
}

/**
 * Everything the screen needs around its routes inside the shadow root: the kit's token scope from the shell's theme (`data-theme`, which also paints the kit's surface, text colour and font on the frame), the text direction from the shell's language (on the frame and on the shadow host), and the bridge for route components.
 */
// @cpt-dod:cpt-template-catalogue-dod-catalogue-screen-host-theme-language:p1
export function ScreenFrame({ bridge, children }: { bridge: ChildMfeBridge; children: ReactNode }) {
  const theme = useBridgeProperty(bridge, FRONTX_SHARED_PROPERTY_THEME, 'light');
  const language = useBridgeProperty(bridge, FRONTX_SHARED_PROPERTY_LANGUAGE, 'en');
  const frameRef = useRef<HTMLDivElement>(null);
  const dir = directionFor(language);

  // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-host-theme:p1:inst-set-direction
  useEffect(() => {
    const rootNode = frameRef.current?.getRootNode();
    if (rootNode && 'host' in rootNode) (rootNode.host as HTMLElement).dir = dir;
  }, [dir]);
  // @cpt-end:cpt-template-catalogue-algo-catalogue-screen-host-theme:p1:inst-set-direction

  // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-host-theme:p1:inst-render-frame
  return (
    <div ref={frameRef} data-theme={kitThemeScopeFor(theme)} dir={dir} data-testid="screen-root">
      <BridgeContext.Provider value={bridge}>{children}</BridgeContext.Provider>
    </div>
  );
  // @cpt-end:cpt-template-catalogue-algo-catalogue-screen-host-theme:p1:inst-render-frame
}
