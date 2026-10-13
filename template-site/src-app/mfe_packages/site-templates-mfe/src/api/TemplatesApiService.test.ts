import type { ApiPluginBase, ApiProtocol } from '@gears-frontx/react';
import { describe, expect, it } from 'vitest';
import { attachRegisteredRestMocks } from '@frontx-test-utils/attachRegisteredRestMocks';
import outline from '../content/outline.generated.json';
import { TemplatesApiService } from './TemplatesApiService';

type ApiServiceWithRegisteredMocks = TemplatesApiService & {
  getPlugins(): Iterable<readonly [ApiProtocol, Iterable<ApiPluginBase>]>;
};

describe('TemplatesApiService', () => {
  it('answers the catalogue endpoint with the generated outline', async () => {
    const service = new TemplatesApiService() as ApiServiceWithRegisteredMocks;
    attachRegisteredRestMocks(service);

    expect(service.getCatalogue.key[1]).toBe('GET');
    const response = await service.getCatalogue.fetch();

    expect(response.screen).toBe('templates');
    expect(response.pages.map((page) => page.route)).toEqual(outline.pages.map((page) => page.route));
  });
});
