import { act } from 'react';
import { render, waitFor } from '@testing-library/react';
import * as chatRuntime from '@gears-frontx/react';
import type { EndpointDescriptor, FrontXApp } from '@gears-frontx/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { getInboxApi } from '@inbox-shared/api/registry';
import { frontxWrapper, startOtherScreenRuntime } from '@inbox-shared/test-support/frontxTestHost';
import { mfeApp } from './init';

/**
 * Two inbox screens in one page, each through its own FrontX runtime and app: the chat's (`init.ts`) and another package's, built in a runtime of its own the way every inbox package builds its app (`buildInboxScreenApp`), joining the page's QueryClient with `queryCacheShared()`. What one screen has read is in that shared cache for the other. Both read through the real service, answered by the shell's mock plugin.
 */
type Screen = {
  app: FrontXApp;
  runtime: Pick<typeof chatRuntime, 'FrontXProvider' | 'useApiQuery'>;
};

const chat: Screen = { app: mfeApp, runtime: chatRuntime };
let contacts: Screen;

beforeAll(async () => {
  contacts = await startOtherScreenRuntime(vi);
});

/** Mounts a reader of `descriptor` in `screen`, as that screen would, and waits until it holds an answer it is not fetching again. */
async function readThrough<T>(screen: Screen, descriptor: EndpointDescriptor<T>): Promise<{ data: T; unmount: () => void }> {
  let latest: T | undefined;
  function Reader() {
    const query = screen.runtime.useApiQuery(descriptor);
    latest = query.isFetching ? undefined : query.data;
    return null;
  }
  const view = render(<Reader />, { wrapper: frontxWrapper(screen.runtime.FrontXProvider, screen.app) });
  await waitFor(() => expect(latest).toBeDefined());
  return { data: latest as T, unmount: view.unmount };
}

describe('the shared query cache under the chat and the contacts screen', () => {
  it('keeps the reads a screen made when another screen package loads for the first time, so going back paints them at once', async () => {
    const service = getInboxApi();
    const read = await readThrough(chat, service.getConversations);
    read.unmount();

    // "View contact": the contacts package loads now, building its app as every inbox package does.
    await startOtherScreenRuntime(vi);
    // The shared cache clears after cancelling its queries, a few ticks later; give it the time to do so.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    // Back to the chat: its first render reads the conversations from the shared cache.
    let first: { isLoading: boolean; count: number | undefined } | undefined;
    function FirstRender() {
      const query = chat.runtime.useApiQuery(service.getConversations);
      first ??= { isLoading: query.isLoading, count: query.data?.conversations.length };
      return null;
    }
    render(<FirstRender />, { wrapper: frontxWrapper(chat.runtime.FrontXProvider, chat.app) });
    await waitFor(() => expect(first).toBeDefined());
    expect(first).toEqual({ isLoading: false, count: read.data.conversations.length });
  });

  it("paints a read another screen made from the shared cache on its first render, without a loading state", async () => {
    const service = getInboxApi();
    const people = await readThrough(chat, service.getContacts);
    people.unmount();

    let first: { isLoading: boolean; count: number | undefined } | undefined;
    function FirstRender() {
      const query = contacts.runtime.useApiQuery(service.getContacts);
      first ??= { isLoading: query.isLoading, count: query.data?.contacts.length };
      return null;
    }
    render(<FirstRender />, { wrapper: frontxWrapper(contacts.runtime.FrontXProvider, contacts.app) });
    await waitFor(() => expect(first).toBeDefined());
    expect(first).toEqual({ isLoading: false, count: people.data.contacts.length });
  });
});
