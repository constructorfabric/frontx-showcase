import { beforeEach, describe, expect, it } from 'vitest';
import type { GetDashboardResponse } from '@inbox-shared/api/dashboardTypes';
import type { GetContactsResponse } from '@inbox-shared/api/types';
import { readInboxMockState, resetInboxMockState } from '@inbox-shared/api/mockStore';
import { inboxMockMap } from '@inbox-shared/api/mocks';
import { dashboardMockMap } from './dashboardMocks';

const contactIdsOf = (): string[] =>
  (inboxMockMap['GET /api/inbox/contacts'](undefined) as GetContactsResponse).contacts.map((contact) => contact.id);

const activityContactIdsOf = (): string[] =>
  (dashboardMockMap['GET /api/dashboard/overview'](undefined) as GetDashboardResponse).activity.map(
    (item) => item.contactId
  );

describe("the people of the dashboard package's mock backend", () => {
  beforeEach(() => {
    resetInboxMockState();
  });

  it('points every activity row at a contact the package lists', () => {
    const listed = new Set(contactIdsOf());
    const rows = activityContactIdsOf();
    expect(rows.length).toBeGreaterThan(0);
    for (const id of rows) expect(listed.has(id), id).toBe(true);
  });

  it("reads the store's people at request time, not the seed", () => {
    const state = readInboxMockState();
    const [first] = state.contacts;
    state.contacts = [{ ...first, id: 'r-only' }];

    expect(contactIdsOf()).toEqual(['r-only']);
    expect(new Set(activityContactIdsOf())).toEqual(new Set(['r-only']));
  });
});
