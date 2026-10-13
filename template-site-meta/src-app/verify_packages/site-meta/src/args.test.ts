// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { parseArgs } from './args.ts';

describe('parseArgs', () => {
  it('takes the command, the project the package sits in and the config inside it by default', () => {
    expect(parseArgs(['generate'], '/repo', '/repo/site')).toEqual({ command: 'generate', paths: expect.objectContaining({ project: '/repo/site', config: '/repo/site/site.config.json' }) });
  });

  it('resolves --project, --config and --rasters against the working directory', () => {
    const parsed = parseArgs(['check', '--project', 'site', '--config', 'site.config.json', '--rasters', 'assets/rasters.json'], '/repo', '/elsewhere');
    expect(parsed).toEqual({
      command: 'check',
      paths: expect.objectContaining({ project: '/repo/site', config: '/repo/site.config.json', dist: '/repo/site/dist' }),
      rasters: '/repo/assets/rasters.json',
    });
  });

  it('refuses an unknown command, an unknown option and an option without its value', () => {
    expect(() => parseArgs(['build'], '/repo', '/repo/site')).toThrow(/usage/);
    expect(() => parseArgs(['check', '--origin', 'x'], '/repo', '/repo/site')).toThrow(/--origin/);
    expect(() => parseArgs(['check', '--config'], '/repo', '/repo/site')).toThrow(/--config/);
  });
});
