import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { DEMOS_NAV_GROUP } from './navGroups';

const executeActionsChain = vi.fn();
let registered: Array<Record<string, unknown>> = [];
let bootstrap: Promise<void> = Promise.resolve();

vi.mock('@/app/mfe/bootstrapOnce', () => ({ bootstrapOnce: () => bootstrap }));
vi.mock('@gears-frontx/react', async (importOriginal) => ({
  ...(await importOriginal<Record<string, never>>()),
  useFrontX: () => app,
  useMountedExtensions: () => [],
  useDomainExtensions: () => registered,
}));

const app = { mfeRegistry: { executeActionsChain } };

const screenExtension = (id: string, route: string, order: number, group?: string) => ({ id, domain: 'd', entry: 'e', route, presentation: { label: id, order, ...(group ? { group } : {}) } });

describe('useScreenNavigation', () => {
  beforeEach(() => {
    executeActionsChain.mockReset();
    registered = [screenExtension('ext.home', '/home', 10)];
    bootstrap = Promise.resolve();
  });

  it('knows no entries until bootstrap settles, then lists the registered screens', async () => {
    let settle: () => void = () => {};
    bootstrap = new Promise<void>((resolve) => {
      settle = resolve;
    });
    const { useScreenNavigation } = await import('./useScreenNavigation');
    const { result } = renderHook(() => useScreenNavigation());
    expect(result.current.entries).toBeUndefined();
    await act(async () => settle());
    expect(result.current.entries?.map((entry) => entry.id)).toEqual(['ext.home']);
  });

  it('adds a screen registered after bootstrap to the menu', async () => {
    const { useScreenNavigation } = await import('./useScreenNavigation');
    const { result, rerender } = renderHook(() => useScreenNavigation());
    await waitFor(() => expect(result.current.entries).toBeDefined());
    registered = [...registered, screenExtension('ext.late', '/late', 20)];
    rerender();
    expect(result.current.entries?.map((entry) => entry.id)).toEqual(['ext.home', 'ext.late']);
  });

  it('leaves out an extension without the route or presentation the screen schema requires', async () => {
    registered = [{ id: 'ext.bare', domain: 'd', entry: 'e' }, screenExtension('ext.home', '/home', 10)];
    const { useScreenNavigation } = await import('./useScreenNavigation');
    const { result } = renderHook(() => useScreenNavigation());
    await waitFor(() => expect(result.current.entries).toBeDefined());
    expect(result.current.entries?.map((entry) => entry.id)).toEqual(['ext.home']);
  });

  it('folds the screens that name a group the host defines into that group', async () => {
    registered = [screenExtension('ext.home', '/home', 10), screenExtension('ext.mail', '/mail', 61, DEMOS_NAV_GROUP.id)];
    const { useScreenNavigation } = await import('./useScreenNavigation');
    const { result } = renderHook(() => useScreenNavigation());
    await waitFor(() => expect(result.current.entries).toBeDefined());
    expect(result.current.entries?.map((entry) => (entry.kind === 'screen' ? entry.id : `group:${entry.id}`))).toEqual(['ext.home', 'group:demos']);
  });

  it('lists nothing when bootstrap fails', async () => {
    bootstrap = Promise.reject(new Error('boom'));
    const { useScreenNavigation } = await import('./useScreenNavigation');
    const { result } = renderHook(() => useScreenNavigation());
    await waitFor(() => expect(result.current.entries).toEqual([]));
  });

  it('opens a screen through the screen domain mount action', async () => {
    const { useScreenNavigation } = await import('./useScreenNavigation');
    const { result } = renderHook(() => useScreenNavigation());
    result.current.open('ext.home');
    expect(executeActionsChain).toHaveBeenCalledWith({ action: expect.objectContaining({ payload: { subject: 'ext.home' } }) });
  });
});
