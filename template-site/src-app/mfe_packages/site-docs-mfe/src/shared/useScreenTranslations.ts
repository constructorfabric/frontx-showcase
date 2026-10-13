/**
 * useScreenTranslations Hook
 *
 * MFE-local i18n loading hook. Accepts a language map produced by
 * `import.meta.glob('./i18n/*.json')` (Vite-compatible glob).
 *
 * The hook:
 * 1. Gets current language from bridge.getProperty(FRONTX_SHARED_PROPERTY_LANGUAGE)
 * 2. Builds module key from language (e.g., './i18n/en.json')
 * 3. Dynamically imports the module
 * 4. Returns t(key) function that looks up key in loaded translations
 * 5. Subscribes to language property changes to reload translations
 *
 * Every load carries a request number. A load that settles after a newer one
 * started, or after the screen unmounted, changes nothing: switching from one
 * language to another and back cannot leave the slower load's strings on
 * screen.
 *
 * Usage in screen component:
 * ```tsx
 * const languageModules = import.meta.glob('./i18n/*.json');
 * const { t, loading } = useScreenTranslations(languageModules, bridge);
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ChildMfeBridge } from '@gears-frontx/react';
import { FRONTX_SHARED_PROPERTY_LANGUAGE } from '@gears-frontx/react';

interface TranslationJsonModule {
  default: Record<string, string>;
}
type LanguageModuleImporter = () => Promise<TranslationJsonModule>;
type LanguageModuleMap = Record<string, LanguageModuleImporter>;

interface UseScreenTranslationsReturn {
  t: (key: string) => string;
  loading: boolean;
}

// @cpt-algo:cpt-template-site-algo-screen-frame-load-translations:p2
// @cpt-dod:cpt-template-site-dod-screen-frame-theme-language:p2
/**
 * The translations of a language, or of English when the language has no module; empty when neither loads.
 */
async function importTranslations(languageModules: LanguageModuleMap, language: string): Promise<Record<string, string>> {
  try {
    // @cpt-begin:cpt-template-site-algo-screen-frame-load-translations:p1:inst-import-language
    const importer = languageModules[`./i18n/${language}.json`];
    if (importer) return (await importer()).default;
    // @cpt-end:cpt-template-site-algo-screen-frame-load-translations:p1:inst-import-language
    // @cpt-begin:cpt-template-site-algo-screen-frame-load-translations:p1:inst-fallback-english
    console.warn(`[useScreenTranslations] No translation module found for language: ${language}, falling back to en`);
    const fallbackImporter = languageModules['./i18n/en.json'];
    if (fallbackImporter) return (await fallbackImporter()).default;
    // @cpt-end:cpt-template-site-algo-screen-frame-load-translations:p1:inst-fallback-english
    // @cpt-begin:cpt-template-site-algo-screen-frame-load-translations:p1:inst-no-english
    console.error('[useScreenTranslations] English fallback not found');
    return {};
    // @cpt-end:cpt-template-site-algo-screen-frame-load-translations:p1:inst-no-english
  // @cpt-begin:cpt-template-site-algo-screen-frame-load-translations:p1:inst-catch-import
  } catch (error) {
    console.error(`[useScreenTranslations] Failed to load translations for ${language}:`, error);
    return {};
  }
  // @cpt-end:cpt-template-site-algo-screen-frame-load-translations:p1:inst-catch-import
}

/**
 * Hook for loading MFE-local translations based on the current language from the bridge.
 *
 * @param languageModules - Language module map from `import.meta.glob('./i18n/*.json')`
 * @param bridge - ChildMfeBridge instance
 * @returns Object with `t(key)` function and `loading` state
 */
export function useScreenTranslations(
  languageModules: LanguageModuleMap,
  bridge: ChildMfeBridge
): UseScreenTranslationsReturn {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  // The language and module map of the latest load, to skip a repeated broadcast or a re-run with the same inputs.
  const currentLanguageRef = useRef<string | null>(null);
  const lastLoadedModulesRef = useRef<LanguageModuleMap | null>(null);
  // The number of the latest load; only that load may apply its result, and only while the screen is mounted.
  const requestRef = useRef(0);
  const mountedRef = useRef(false);

  // @cpt-begin:cpt-template-site-algo-screen-frame-load-translations:p1:inst-track-mounted
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  // @cpt-end:cpt-template-site-algo-screen-frame-load-translations:p1:inst-track-mounted

  const loadTranslations = useCallback(
    async (language: string) => {
      // @cpt-begin:cpt-template-site-algo-screen-frame-load-translations:p1:inst-start-load
      currentLanguageRef.current = language;
      lastLoadedModulesRef.current = languageModules;
      const request = ++requestRef.current;
      setLoading(true);
      const loaded = await importTranslations(languageModules, language);
      // @cpt-end:cpt-template-site-algo-screen-frame-load-translations:p1:inst-start-load
      // @cpt-begin:cpt-template-site-algo-screen-frame-load-translations:p1:inst-ignore-stale
      if (request !== requestRef.current || !mountedRef.current) return;
      // @cpt-end:cpt-template-site-algo-screen-frame-load-translations:p1:inst-ignore-stale
      // @cpt-begin:cpt-template-site-algo-screen-frame-load-translations:p1:inst-apply-strings
      setTranslations(loaded);
      setLoading(false);
      // @cpt-end:cpt-template-site-algo-screen-frame-load-translations:p1:inst-apply-strings
    },
    [languageModules]
  );

  useEffect(() => {
    // @cpt-begin:cpt-template-site-algo-screen-frame-load-translations:p1:inst-initial-load
    const initialProperty = bridge.getProperty(FRONTX_SHARED_PROPERTY_LANGUAGE);
    const lang = initialProperty && typeof initialProperty.value === 'string' ? initialProperty.value : 'en';
    if (lang !== currentLanguageRef.current || lastLoadedModulesRef.current !== languageModules) {
      void loadTranslations(lang);
    }
    // @cpt-end:cpt-template-site-algo-screen-frame-load-translations:p1:inst-initial-load

    // @cpt-begin:cpt-template-site-algo-screen-frame-load-translations:p1:inst-follow-language
    const unsubscribe = bridge.subscribeToProperty(FRONTX_SHARED_PROPERTY_LANGUAGE, (property) => {
      if (typeof property.value === 'string' && (property.value !== currentLanguageRef.current || lastLoadedModulesRef.current !== languageModules)) {
        void loadTranslations(property.value);
      }
    });
    // @cpt-end:cpt-template-site-algo-screen-frame-load-translations:p1:inst-follow-language

    // @cpt-begin:cpt-template-site-algo-screen-frame-load-translations:p1:inst-unsubscribe
    return unsubscribe;
    // @cpt-end:cpt-template-site-algo-screen-frame-load-translations:p1:inst-unsubscribe
  }, [bridge, languageModules, loadTranslations]);

  // @cpt-begin:cpt-template-site-algo-screen-frame-load-translations:p1:inst-translate
  const t = useCallback(
    (key: string): string => {
      const translation = translations[key];
      if (translation === undefined) {
        console.warn(`[useScreenTranslations] Missing translation key: ${key}`);
        return key;
      }
      return translation;
    },
    [translations]
  );
  // @cpt-end:cpt-template-site-algo-screen-frame-load-translations:p1:inst-translate

  // @cpt-begin:cpt-template-site-algo-screen-frame-load-translations:p1:inst-return-translations
  return { t, loading };
  // @cpt-end:cpt-template-site-algo-screen-frame-load-translations:p1:inst-return-translations
}
