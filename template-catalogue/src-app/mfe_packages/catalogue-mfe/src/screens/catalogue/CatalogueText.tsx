import { createContext, useContext, type ReactNode } from 'react';
import { useBridge } from '../../frame/ScreenFrame';
import { useScreenTranslations } from '../../frame/useScreenTranslations';

// Hoisted to module level: a new map per render would reload the translations on every render.
const languageModules = import.meta.glob('./i18n/*.json') as Record<string, () => Promise<{ default: Record<string, string> }>>;

interface CatalogueText {
  t: (key: string) => string;
  loading: boolean;
}

const CatalogueTextContext = createContext<CatalogueText | null>(null);

/** Loads the screen's strings once for the whole route tree, in the shell's language. */
// @cpt-algo:cpt-template-catalogue-algo-catalogue-screen-load-strings:p1
export function CatalogueTextProvider({ children }: { children: ReactNode }) {
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-load-strings:p1:inst-provide-strings
  const text = useScreenTranslations(languageModules, useBridge());
  // @cpt-end:cpt-template-catalogue-algo-catalogue-screen-load-strings:p1:inst-provide-strings
  return <CatalogueTextContext.Provider value={text}>{children}</CatalogueTextContext.Provider>;
}

/** The screen's strings, for components inside `CatalogueTextProvider`. */
export function useCatalogueText(): CatalogueText {
  const text = useContext(CatalogueTextContext);
  if (!text) throw new Error('useCatalogueText must be used inside CatalogueTextProvider');
  return text;
}
