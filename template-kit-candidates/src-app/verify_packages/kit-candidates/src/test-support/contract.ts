// The overlay half of a kit contract, checked here because the kit's contract compiler and its freshness suite live in the kit repository: the compiled `.contract.json` is produced there when the candidate is proposed upstream. This check holds what the overlay must say on its own: the component name, the intent, typical uses, every "don't use when" with an alternative that names a real component, invariants, and no machine-extractable fact restated.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as kit from '@gears-frontx/ui-kit';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

import * as candidates from '../index.js';

const COMPONENTS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'components');
const GTS_PREFIX = 'gts.frontx.uikit._.component.v1~frontx.uikit._.';
const MACHINE_FACTS = ['props', 'variants', 'axes', 'defaults', 'element', 'host_element'];

interface Overlay {
  component?: unknown;
  intent?: unknown;
  typical_uses?: unknown;
  dont_use_when?: Array<{ situation?: unknown; instead?: { target?: unknown; component?: unknown } }>;
  invariants?: Array<{ id?: unknown; text?: unknown }>;
  anti_patterns?: Array<{ dont?: unknown; do_instead?: unknown }>;
  examples?: { good?: unknown[]; bad?: unknown[] };
  [key: string]: unknown;
}

function snakeCase(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

/** Every component name a contract may point at: the installed kit's exports and this package's own. */
function knownComponents(): Set<string> {
  return new Set([...Object.keys(kit), ...Object.keys(candidates)].map(snakeCase));
}

export function readOverlay(folder: string, file: string): Overlay {
  return parse(readFileSync(join(COMPONENTS_DIR, folder, file), 'utf8')) as Overlay;
}

/**
 * The overlay checks for one contract file of a component folder.
 * @param folder - the component folder, for example `heading`
 * @param file - the overlay file, for example `heading.contract.yaml`
 * @param component - the component slug the overlay names, for example `heading`
 */
export function assertOverlay(folder: string, file: string, component: string): void {
  describe(`${file} overlay`, () => {
    const overlay = readOverlay(folder, file);

    it('names its component and states an intent and typical uses', () => {
      expect(overlay.component).toBe(component);
      expect(typeof overlay.intent).toBe('string');
      expect(Array.isArray(overlay.typical_uses) && overlay.typical_uses.length > 0).toBe(true);
    });

    it('gives every "don\'t use when" an alternative that names a real component', () => {
      const known = knownComponents();
      expect((overlay.dont_use_when ?? []).length).toBeGreaterThan(0);
      for (const entry of overlay.dont_use_when ?? []) {
        expect(typeof entry.situation).toBe('string');
        expect(typeof entry.instead?.target).toBe('string');
        const id = entry.instead?.component;
        if (id === undefined) continue;
        expect(typeof id).toBe('string');
        const slug = String(id).startsWith(GTS_PREFIX) ? String(id).slice(GTS_PREFIX.length).replace(/\.v1$/, '') : '';
        expect(known.has(slug), `${String(id)} names no kit or candidate component`).toBe(true);
      }
    });

    it('states invariants with ids, and good and bad examples', () => {
      expect((overlay.invariants ?? []).length).toBeGreaterThan(0);
      for (const invariant of overlay.invariants ?? []) {
        expect(typeof invariant.id).toBe('string');
        expect(typeof invariant.text).toBe('string');
      }
      expect((overlay.examples?.good ?? []).length).toBeGreaterThan(0);
      expect((overlay.examples?.bad ?? []).length).toBeGreaterThan(0);
    });

    it('restates no fact the compiler extracts from the source', () => {
      for (const key of MACHINE_FACTS) expect(overlay).not.toHaveProperty(key);
    });
  });
}
