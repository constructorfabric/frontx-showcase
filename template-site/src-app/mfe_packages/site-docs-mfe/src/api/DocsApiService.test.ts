import type { ApiPluginBase, ApiProtocol } from '@gears-frontx/react';
import { describe, expect, it } from 'vitest';
import { attachRegisteredRestMocks } from '@frontx-test-utils/attachRegisteredRestMocks';
import versions from '../data/versions.generated.json';
import { DocsApiService } from './DocsApiService';

type ApiServiceWithRegisteredMocks = DocsApiService & {
  getPlugins(): Iterable<readonly [ApiProtocol, Iterable<ApiPluginBase>]>;
};

describe('DocsApiService', () => {
  it('answers the versions endpoint with the generated data', async () => {
    const service = new DocsApiService() as ApiServiceWithRegisteredMocks;
    attachRegisteredRestMocks(service);

    expect(service.getVersions.key[1]).toBe('GET');
    const response = await service.getVersions.fetch();

    expect(response.vars).toEqual(versions.vars);
  });
});
