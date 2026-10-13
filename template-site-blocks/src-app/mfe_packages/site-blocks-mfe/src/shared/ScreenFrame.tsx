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
export function useBridgeProperty(bridge: ChildMfeBridge, property: string, fallback: string): string {
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
}

/** Direction of a language code, by its primary subtag. */
export function directionFor(language: string): 'ltr' | 'rtl' {
  return RTL_LANGUAGES.has(language.split('-')[0]?.toLowerCase() ?? '') ? 'rtl' : 'ltr';
}

// @cpt-dod:cpt-template-site-blocks-dod-blocks-showcase-screen:p1
// @cpt-flow:cpt-template-site-blocks-flow-blocks-showcase-open:p1
/**
 * Everything the screen needs around its routes inside the shadow root: the kit's token scope from the shell's theme (`data-theme`), the text direction from the shell's language (both on the frame and on the shadow host), and the bridge for route components. The frame carries no stylesheet: the kit's `[data-theme]` rule paints its surface, ink and typeface.
 */
export function ScreenFrame({ bridge, children }: { bridge: ChildMfeBridge; children: ReactNode }) {
  const theme = useBridgeProperty(bridge, FRONTX_SHARED_PROPERTY_THEME, 'light');
  const language = useBridgeProperty(bridge, FRONTX_SHARED_PROPERTY_LANGUAGE, 'en');
  const frameRef = useRef<HTMLDivElement>(null);
  const dir = directionFor(language);
  const scope = kitThemeScopeFor(theme);

  // Kit overlays (popovers, dialogs) open at the shadow root's top level, outside this frame; the host carries the scope and direction too, so they resolve the same tokens.
  useEffect(() => {
    const rootNode = frameRef.current?.getRootNode();
    if (rootNode && 'host' in rootNode) {
      const host = rootNode.host as HTMLElement;
      host.dir = dir;
      host.dataset.theme = scope;
    }
  }, [dir, scope]);

  // @cpt-begin:cpt-template-site-blocks-flow-blocks-showcase-open:p1:inst-frame
  return (
    <div ref={frameRef} data-theme={scope} dir={dir} data-testid="screen-root">
      <BridgeContext.Provider value={bridge}>{children}</BridgeContext.Provider>
    </div>
  );
  // @cpt-end:cpt-template-site-blocks-flow-blocks-showcase-open:p1:inst-frame
}
