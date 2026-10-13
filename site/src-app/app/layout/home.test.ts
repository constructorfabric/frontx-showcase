import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { addressNamesDomain, HOME_SCREEN_TOKEN } from './home';

describe('HOME_SCREEN_TOKEN', () => {
  it('is the homeScreen of the repository site.config.json, the key the build-time head-sync reads for the bare address', () => {
    const configPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../site.config.json');
    const config: unknown = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    expect(config).toHaveProperty('homeScreen', HOME_SCREEN_TOKEN);
    expect(HOME_SCREEN_TOKEN).not.toBe('');
  });
});

describe('addressNamesDomain', () => {
  const at = (search: string) => ({ pathname: '/', search });

  it('finds an entry of the domain in a deep link and none at the bare address', () => {
    expect(addressNamesDomain(at('?screen=libs;route=routing'), 'screen')).toBe(true);
    expect(addressNamesDomain(at(''), 'screen')).toBe(false);
    expect(addressNamesDomain(at('?widgets=widget-alpha'), 'screen')).toBe(false);
  });
});
