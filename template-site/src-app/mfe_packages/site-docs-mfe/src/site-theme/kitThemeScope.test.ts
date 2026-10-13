import { describe, expect, it } from 'vitest';
import { kitThemeScopeFor } from '@site-shared/theme/kitThemeScope';

/*
 * The four screen packages of this template share one copy of the mapping in
 * the template's shared folder, so this package tests it once for all four. A
 * screen test that happens to switch themes covers only the screens it
 * renders, so the mapping keeps its own coverage here.
 */
describe('kitThemeScopeFor', () => {
  // Every dark palette the host registers has to reach the kit's dark scope: a
  // miss puts a light kit surface on dark host chrome, with no error anywhere.
  it('maps every dark host theme onto the kit dark scope', () => {
    for (const darkTheme of ['dark', 'dracula', 'dracula-large']) {
      expect(kitThemeScopeFor(darkTheme)).toBe('dark');
    }
  });

  it('maps the light host themes onto the kit light scope', () => {
    for (const lightTheme of ['default', 'light']) {
      expect(kitThemeScopeFor(lightTheme)).toBe('light');
    }
  });

  // An identifier this mapping does not know resolves to the light scope rather
  // than to no scope: an element carrying neither value inherits whatever the
  // kit's prefers-color-scheme fallback resolved on the shadow host, which is
  // how a screen ends up dark inside a light shell on a dark-mode machine.
  it('falls back to the light scope for an unregistered identifier', () => {
    expect(kitThemeScopeFor('smoke-theme')).toBe('light');
    expect(kitThemeScopeFor('')).toBe('light');
  });
});
