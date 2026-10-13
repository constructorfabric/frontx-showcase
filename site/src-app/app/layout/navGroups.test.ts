import { describe, expect, it } from 'vitest';
import { gtsPlugin } from '@gears-frontx/react';
import { extensionScreenSchema } from '@gears-frontx/frontx-template-shell';
import { DEMOS_NAV_GROUP, NAV_GROUP_NAMES, NAV_GROUPS, registerNavGroups } from './navGroups';
import { HEADER_HIDDEN_GROUPS } from './site';

const SCREEN_TYPE = 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~';
const SCREEN_DOMAIN = 'gts.frontx.mfes.ext.domain.v1~frontx.screensets.layout.screen.v1';
const ENTRY = 'gts.frontx.mfes.mfe.entry.v1~frontx.mfes.mfe.entry_mf.v1~fixture.billing.mfe.home.v1';

/** The type system as the host has it after bootstrap: the shell's screen extension schema and the host's nav groups. App-layer code reaches only the host's singleton, so every case registers extensions under ids of its own. */
function typeSystem(): typeof gtsPlugin {
  gtsPlugin.registerSchema(extensionScreenSchema);
  registerNavGroups(gtsPlugin);
  return gtsPlugin;
}

const screenExtension = (name: string, presentation: Record<string, unknown>) => ({
  id: `${SCREEN_TYPE}fixture.billing.screens.${name}.v1`,
  domain: SCREEN_DOMAIN,
  entry: ENTRY,
  route: `/${name}`,
  presentation,
});

describe("the host's nav groups", () => {
  it('are instances of the nav group type, each named once', () => {
    const plugin = typeSystem();
    expect(new Set(NAV_GROUPS.map((group) => group.name)).size).toBe(NAV_GROUPS.length);
    for (const group of NAV_GROUPS) expect(plugin.validateInstance(group.id).valid, group.id).toBe(true);
  });

  it('include every group site.config.json hides from the header', () => {
    // The site hides no group today, so this holds trivially; it guards a group a later config names.
    const defined = new Set(NAV_GROUP_NAMES.values());
    expect(HEADER_HIDDEN_GROUPS.filter((name) => !defined.has(name))).toEqual([]);
  });

  it('leave the demos group in the header, the one place that lists the demo screens', () => {
    expect(HEADER_HIDDEN_GROUPS).not.toContain(DEMOS_NAV_GROUP.name);
  });
});

describe('the screen extension type', () => {
  it('accepts a screen without a group and a screen that names a nav group instance', () => {
    const plugin = typeSystem();
    expect(() => plugin.register(screenExtension('home', { label: 'Home' }))).not.toThrow();
    expect(() => plugin.register(screenExtension('mail', { label: 'Mail', order: 61, group: DEMOS_NAV_GROUP.id }))).not.toThrow();
  });

  it('refuses a group that is not a nav group id', () => {
    expect(() => typeSystem().register(screenExtension('chat', { label: 'Chat', group: 'demos' }))).toThrow(/validation failed/);
  });
});

type PackageManifest = { schemas?: Array<{ $id?: string }>; extensions?: Array<{ id: string; presentation?: { group?: unknown } }> };

/** The assembled packages' manifests (`npm run site:assemble` writes them), by package directory. */
const packageManifests = Object.entries(import.meta.glob<PackageManifest>('../../mfe_packages/*/mfe.json', { eager: true, import: 'default' })).map(([file, manifest]) => ({ name: file.split('/').slice(-2)[0] ?? file, manifest }));

describe('the assembled screen packages', () => {
  it('are present to check (npm run site:assemble writes them)', () => {
    expect(packageManifests.length).toBeGreaterThan(0);
  });

  it('name only groups the host defines, and register through the type system', () => {
    const plugin = typeSystem();
    let grouped = 0;
    for (const { name, manifest } of packageManifests) {
      for (const extension of manifest.extensions ?? []) {
        const group = extension.presentation?.group;
        if (group === undefined) continue;
        grouped += 1;
        expect(NAV_GROUP_NAMES.has(String(group)), `${name}: ${extension.id}`).toBe(true);
        expect(() => plugin.register(extension), `${name}: ${extension.id}`).not.toThrow();
      }
    }
    // The demo screens name the demos group, so a composed site has grouped screens to check.
    expect(grouped).toBeGreaterThan(0);
  });
});
