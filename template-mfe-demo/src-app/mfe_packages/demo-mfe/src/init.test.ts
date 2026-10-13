import { afterEach, describe, expect, it, vi } from 'vitest';

const build = vi.fn();
const use = vi.fn();
const createFrontX = vi.fn(() => ({
  use,
}));
const register = vi.fn();
const initialize = vi.fn();
const effects = vi.fn(() => 'effects-plugin');
const queryCacheShared = vi.fn(() => 'query-cache-shared-plugin');
const mock = vi.fn(() => 'mock-plugin');
const microfrontends = vi.fn(() => 'microfrontends-plugin');
const gtsPlugin = { name: 'gts-plugin' };

vi.mock('@gears-frontx/react', () => ({
  createFrontX,
  apiRegistry: {
    register,
    initialize,
  },
  effects,
  gtsPlugin,
  microfrontends,
  mock,
  queryCacheShared,
}));

vi.mock('./api/AccountsApiService', () => ({
  AccountsApiService: class AccountsApiService {
    /** Test double only; `register` needs a constructor reference. */
    static readonly serviceId = 'AccountsApiService';
  },
}));

describe('demo-mfe init', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    use.mockImplementation(() => ({ use, build }));
    build.mockReturnValue({ id: 'mfe-app' });
  });

  it('registers services before building the MFE app and exports the built app', async () => {
    use.mockImplementation(() => ({ use, build }));
    const expectedApp = { id: 'mfe-app' };
    build.mockReturnValue(expectedApp);

    const module = await import('./init');

    expect(register).toHaveBeenCalledTimes(1);
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(createFrontX).toHaveBeenCalledTimes(1);
    expect(effects).toHaveBeenCalledTimes(1);
    expect(queryCacheShared).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledTimes(1);
    expect(microfrontends).toHaveBeenCalledWith({ typeSystem: gtsPlugin });
    expect(use).toHaveBeenCalledTimes(4);
    expect(use.mock.calls).toEqual(expect.arrayContaining([
      ['effects-plugin'],
      ['query-cache-shared-plugin'],
      ['mock-plugin'],
      ['microfrontends-plugin'],
    ]));
    expect(build).toHaveBeenCalledTimes(1);
    expect(module.mfeApp).toBe(expectedApp);
  });

  it('adds the mock plugin before the shared query cache plugin', async () => {
    await import('./init');

    expect(use.mock.calls).toEqual([
      ['effects-plugin'],
      ['mock-plugin'],
      ['query-cache-shared-plugin'],
      ['microfrontends-plugin'],
    ]);
  });
});
