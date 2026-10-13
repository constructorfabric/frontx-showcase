import { afterEach, describe, expect, it, vi } from 'vitest';

describe('seedClock', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it("measures every instant back from the moment the package's copy of the module loaded", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-01T12:00:00.000Z'));
    vi.resetModules();
    const clock = await import('@inbox-shared/api/seedClock');
    vi.advanceTimersByTime(60_000);

    expect(clock.ANCHOR_MS).toBe(Date.parse('2026-10-01T12:00:00.000Z'));
    expect(clock.minutesAgo(30)).toBe('2026-10-01T11:30:00.000Z');
    expect(clock.hoursAgo(1)).toBe('2026-10-01T11:00:00.000Z');
    expect(clock.daysAgo(1)).toBe('2026-09-30T12:00:00.000Z');
  });

  it("gives a package's copy loaded later its own, later anchor", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-01T12:00:00.000Z'));
    vi.resetModules();
    const first = await import('@inbox-shared/api/seedClock');
    vi.advanceTimersByTime(60_000);
    vi.resetModules();
    const second = await import('@inbox-shared/api/seedClock');

    expect(second.ANCHOR_MS - first.ANCHOR_MS).toBe(60_000);
  });
});
