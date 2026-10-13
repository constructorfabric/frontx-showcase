import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FRONTX_SHARED_PROPERTY_LANGUAGE } from '@gears-frontx/react';
import { createMfeBridgeFixture } from '@frontx-test-utils/createMfeBridgeFixture';
import { cataloguesFromFiles, SHARED_CATALOGUES, useInboxTranslate } from '@inbox-shared/i18n/useInboxTranslate';
import sharedEn from '@inbox-shared/i18n/en.json';

const catalogues = { en: { greeting: 'Hello' }, de: { greeting: 'Hallo' } };
/** The shared layer with a German catalogue too: a language is chosen only when both layers have it. */
const sharedWithGerman = { ...SHARED_CATALOGUES, de: { ...sharedEn, retry: 'Erneut versuchen' } };

const bridgeIn = (language?: string) =>
  createMfeBridgeFixture({
    extDomainId: 'domain',
    extensionId: 'extension',
    ...(language === undefined ? {} : { initialProperties: { [FRONTX_SHARED_PROPERTY_LANGUAGE]: language } }),
  });

describe('useInboxTranslate', () => {
  it("translates in the shell's language and follows a switch", () => {
    const fixture = bridgeIn('en');
    const { result } = renderHook(() => useInboxTranslate(fixture.bridge, catalogues, sharedWithGerman));
    expect(result.current('greeting')).toBe('Hello');
    expect(result.current('retry')).toBe(sharedEn.retry);

    act(() => fixture.setProperty(FRONTX_SHARED_PROPERTY_LANGUAGE, 'de'));
    expect(result.current('greeting')).toBe('Hallo');
    expect(result.current('retry')).toBe('Erneut versuchen');
  });

  it('falls back to en as a whole for a language either layer lacks', () => {
    const fixture = bridgeIn('fr');
    const { result } = renderHook(() => useInboxTranslate(fixture.bridge, catalogues, sharedWithGerman));
    expect(result.current('greeting')).toBe('Hello');

    // The package has German, the shipped shared layer does not: the screen stays in one language.
    act(() => fixture.setProperty(FRONTX_SHARED_PROPERTY_LANGUAGE, 'de'));
    const { result: shipped } = renderHook(() => useInboxTranslate(fixture.bridge, catalogues));
    expect(shipped.current('greeting')).toBe('Hello');
    expect(shipped.current('retry')).toBe(sharedEn.retry);
  });

  it('reads en while the shell has published no language', () => {
    const fixture = bridgeIn();
    const { result } = renderHook(() => useInboxTranslate(fixture.bridge, catalogues));

    expect(result.current('greeting')).toBe('Hello');
  });
});

describe('cataloguesFromFiles', () => {
  it('names each catalogue by its file name, so a new language is only a new file', () => {
    expect(cataloguesFromFiles({ './en.json': { a: 'A' }, './de.json': { a: 'Ä' } })).toEqual({ en: { a: 'A' }, de: { a: 'Ä' } });
    expect(Object.keys(SHARED_CATALOGUES)).toEqual(['en']);
  });
});
