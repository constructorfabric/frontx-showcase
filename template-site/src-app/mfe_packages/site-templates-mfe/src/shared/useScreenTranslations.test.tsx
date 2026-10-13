import { act, renderHook, waitFor } from '@testing-library/react';
import {
  FRONTX_SHARED_PROPERTY_LANGUAGE,
  type ChildMfeBridge,
  type SharedProperty,
} from '@gears-frontx/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useScreenTranslations } from './useScreenTranslations';

afterEach(() => {
  vi.restoreAllMocks();
});

type LanguageProperty = SharedProperty;

function makeBridge(language: string): ChildMfeBridge {
  return {
    extDomainId: 'test-domain',
    extensionId: 'test-instance',
    getProperty: vi.fn(() => ({
      id: FRONTX_SHARED_PROPERTY_LANGUAGE,
      value: language,
    })),
    subscribeToProperty: vi.fn(() => vi.fn()),
    executeActionsChain: vi.fn().mockReturnValue(undefined),
    registerActionHandler: vi.fn(),
  };
}

describe('useScreenTranslations', () => {
  it('loads the translation module for the current bridge language', async () => {
    const enImporter = vi.fn(async () => ({ default: { greeting: 'Hello' } }));
    const languageModules = { './i18n/en.json': enImporter };

    const { result } = renderHook(() =>
      useScreenTranslations(languageModules, makeBridge('en')),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.t('greeting')).toBe('Hello');
  });

  it('returns the key itself when a translation key is missing', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const languageModules = {
      './i18n/en.json': async () => ({ default: { greeting: 'Hello' } }),
    };

    const { result } = renderHook(() =>
      useScreenTranslations(languageModules, makeBridge('en')),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.t('missing_key')).toBe('missing_key');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain('Missing translation key');
    expect(warnSpy.mock.calls[0]?.[0]).toContain('missing_key');
  });

  it('warns and falls back to en when the requested language module is absent', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const enImporter = vi.fn(async () => ({ default: { greeting: 'Hello' } }));
    const languageModules = { './i18n/en.json': enImporter };

    const { result } = renderHook(() =>
      useScreenTranslations(languageModules, makeBridge('fr')),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    // The hook emits a warning and serves English content when falling back to en.
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain('No translation module found');
    expect(warnSpy.mock.calls[0]?.[0]).toContain('fr');
    expect(warnSpy.mock.calls[0]?.[0]).toContain('falling back to en');
    expect(result.current.t('greeting')).toBe('Hello');
  });

  it('reloads translations when the bridge language changes', async () => {
    const enImporter = vi.fn(async () => ({ default: { greeting: 'Hello' } }));
    const frImporter = vi.fn(async () => ({ default: { greeting: 'Bonjour' } }));
    const languageModules = {
      './i18n/en.json': enImporter,
      './i18n/fr.json': frImporter,
    };
    let subscriptionCallback: ((property: LanguageProperty) => void) | undefined;
    const bridge: ChildMfeBridge = {
      extDomainId: 'test-domain',
      extensionId: 'test-instance',
      getProperty: vi.fn(() => ({
        id: FRONTX_SHARED_PROPERTY_LANGUAGE,
        value: 'en',
      })),
      subscribeToProperty: vi.fn(
        (_propertyName: string, callback: (property: LanguageProperty) => void) => {
          subscriptionCallback = callback;
          return vi.fn();
        },
      ),
      executeActionsChain: vi.fn().mockReturnValue(undefined),
      registerActionHandler: vi.fn(),
    };

    const { result } = renderHook(() =>
      useScreenTranslations(languageModules, bridge),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.t('greeting')).toBe('Hello');
    });

    await act(async () => {
      subscriptionCallback?.({
        id: FRONTX_SHARED_PROPERTY_LANGUAGE,
        value: 'fr',
      });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.t('greeting')).toBe('Bonjour');
    });

    expect(enImporter).toHaveBeenCalledTimes(1);
    expect(frImporter).toHaveBeenCalledTimes(1);

    // Repeating the same language should not trigger another import.
    await act(async () => {
      subscriptionCallback?.({
        id: FRONTX_SHARED_PROPERTY_LANGUAGE,
        value: 'fr',
      });
    });

    await waitFor(() => {
      expect(frImporter).toHaveBeenCalledTimes(1);
    });
  });

  it('unsubscribes from bridge language updates on unmount', async () => {
    const unsubscribe = vi.fn();
    const bridge: ChildMfeBridge = {
      extDomainId: 'test-domain',
      extensionId: 'test-instance',
      getProperty: vi.fn(() => ({
        id: FRONTX_SHARED_PROPERTY_LANGUAGE,
        value: 'en',
      })),
      subscribeToProperty: vi.fn(() => unsubscribe),
      executeActionsChain: vi.fn().mockReturnValue(undefined),
      registerActionHandler: vi.fn(),
    };
    const languageModules = {
      './i18n/en.json': async () => ({ default: { greeting: 'Hello' } }),
    };

    const { unmount } = renderHook(() =>
      useScreenTranslations(languageModules, bridge),
    );

    await waitFor(() => {
      expect(bridge.subscribeToProperty).toHaveBeenCalledTimes(1);
    });

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('keeps the strings of the latest language when an earlier load settles after it', async () => {
    let resolveSlow: ((module: { default: Record<string, string> }) => void) | undefined;
    const enImporter = vi.fn(async () => ({ default: { greeting: 'Hello' } }));
    const deImporter = vi.fn(
      () =>
        new Promise<{ default: Record<string, string> }>((resolve) => {
          resolveSlow = resolve;
        }),
    );
    const languageModules = { './i18n/en.json': enImporter, './i18n/de.json': deImporter };
    let subscriptionCallback: ((property: LanguageProperty) => void) | undefined;
    const bridge: ChildMfeBridge = Object.assign(makeBridge('en'), {
      subscribeToProperty: vi.fn((_propertyName: string, callback: (property: LanguageProperty) => void) => {
        subscriptionCallback = callback;
        return vi.fn();
      }),
    });

    const { result } = renderHook(() => useScreenTranslations(languageModules, bridge));
    await waitFor(() => expect(result.current.t('greeting')).toBe('Hello'));

    // de starts and stays pending; en starts after it and settles first.
    act(() => subscriptionCallback?.({ id: FRONTX_SHARED_PROPERTY_LANGUAGE, value: 'de' }));
    await act(async () => subscriptionCallback?.({ id: FRONTX_SHARED_PROPERTY_LANGUAGE, value: 'en' }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.t('greeting')).toBe('Hello');

    await act(async () => resolveSlow?.({ default: { greeting: 'Hallo' } }));
    expect(result.current.t('greeting')).toBe('Hello');
    expect(result.current.loading).toBe(false);
  });
});
