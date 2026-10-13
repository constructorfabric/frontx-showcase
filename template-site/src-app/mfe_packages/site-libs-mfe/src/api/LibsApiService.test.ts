import type { ApiPluginBase, ApiProtocol } from '@gears-frontx/react';
import { describe, expect, it } from 'vitest';
import { attachRegisteredRestMocks } from '@frontx-test-utils/attachRegisteredRestMocks';
import data from '../data/libraries.generated.json';
import { LibsApiService } from './LibsApiService';

type ApiServiceWithRegisteredMocks = LibsApiService & {
  getPlugins(): Iterable<readonly [ApiProtocol, Iterable<ApiPluginBase>]>;
};

describe('LibsApiService', () => {
  it('answers the libraries endpoint with the generated data', async () => {
    const service = new LibsApiService() as ApiServiceWithRegisteredMocks;
    attachRegisteredRestMocks(service);

    expect(service.getLibraries.key[1]).toBe('GET');
    const response = await service.getLibraries.fetch();

    expect(response.vars).toEqual(data.vars);
    expect(response.libraries.map((library) => library.package)).toEqual(data.libraries.map((library) => library.package));
    expect(response.shellPackages.map((entry) => entry.package)).toEqual(data.shellPackages.map((entry) => entry.package));
  });
});
