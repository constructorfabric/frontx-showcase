import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ScreenErrorBoundary } from '@inbox-shared/lifecycle/ScreenErrorBoundary';
import { t } from '../test-support/translate';

function Page({ broken }: { broken: boolean }) {
  if (broken) throw new Error('page failed');
  return <p>page content</p>;
}

describe('ScreenErrorBoundary', () => {
  it('replaces a failed page with the alert, and clears it once the reset key moves to another page', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const view = render(
      <ScreenErrorBoundary t={t} resetKey="/r-1">
        <Page broken />
      </ScreenErrorBoundary>
    );
    expect(screen.getByText(t('app_error_title'))).toBeTruthy();

    // Still the broken page: the alert stays.
    view.rerender(
      <ScreenErrorBoundary t={t} resetKey="/r-1">
        <Page broken={false} />
      </ScreenErrorBoundary>
    );
    expect(screen.getByText(t('app_error_title'))).toBeTruthy();

    view.rerender(
      <ScreenErrorBoundary t={t} resetKey="/">
        <Page broken={false} />
      </ScreenErrorBoundary>
    );
    expect(screen.queryByText(t('app_error_title'))).toBeNull();
    expect(screen.getByText('page content')).toBeTruthy();
  });

  it('offers Try again as its only way out, which renders the page afresh', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let broken = true;
    function Flaky() {
      return <Page broken={broken} />;
    }
    render(
      <ScreenErrorBoundary t={t}>
        <Flaky />
      </ScreenErrorBoundary>
    );
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([t('retry')]);

    broken = false;
    act(() => {
      screen.getByRole('button', { name: t('retry') }).click();
    });
    expect(screen.queryByText(t('app_error_title'))).toBeNull();
    expect(screen.getByText('page content')).toBeTruthy();
  });
});
