import { describe, expect, it, vi } from 'vitest';
import { firstPaintOf } from '@inbox-shared/ui/QueryStates';

type Query = Parameters<typeof firstPaintOf>[0][number];

/** A query result as `useApiQuery` answers it, with what the first paint reads. */
const query = (state: Partial<Pick<Query, 'data' | 'isLoading' | 'isFetching' | 'error'>>): Query => ({
  data: undefined,
  isLoading: false,
  isFetching: false,
  error: null,
  refetch: vi.fn(),
  ...state,
});

const answered = { data: { items: [] } };

describe('firstPaintOf', () => {
  it('waits for a query that has not answered yet', () => {
    expect(firstPaintOf([query(answered), query({ isLoading: true, isFetching: true })])).toMatchObject({ failed: false, loading: true });
  });

  it('shows the error when a query that never answered failed, and asks only it again on retry', () => {
    const failed = query({ error: new Error('offline') });
    const ok = query(answered);
    const paint = firstPaintOf([ok, failed]);
    expect(paint).toMatchObject({ failed: true, loading: false });
    paint.retry();
    expect(failed.refetch).toHaveBeenCalledTimes(1);
    expect(ok.refetch).not.toHaveBeenCalled();
  });

  it('shows the loading state while a query that never answered is asked again after failing', () => {
    expect(firstPaintOf([query({ error: new Error('offline'), isFetching: true })])).toMatchObject({ failed: false, loading: true });
  });

  it('keeps a painted screen when a background refetch of its data fails, or while it runs again', () => {
    // TanStack keeps the last answer and sets the error when a refetch fails: the data is still on screen.
    expect(firstPaintOf([query({ ...answered, error: new Error('refocus refetch failed') })])).toMatchObject({ failed: false, loading: false });
    expect(firstPaintOf([query({ ...answered, error: new Error('refocus refetch failed'), isFetching: true })])).toMatchObject({ failed: false, loading: false });
  });
});
