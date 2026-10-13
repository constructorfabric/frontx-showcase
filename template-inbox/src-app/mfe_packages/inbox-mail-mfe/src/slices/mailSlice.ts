/**
 * The mail screen's client-side state, a FrontX slice in the package's store, the way the chat keeps its own: the shell unmounts the screen when another one takes its place, but the package's app and its store live for the page, so leaving the section and coming back returns to the same mailbox, the same open mail, the same search and tab and the same drafts.
 *
 * A sent mail is not the client's: the mail service files it under Sent (the package's mail mock state keeps it, `api/mailMockStore.ts`), the send invalidates the cached mail list, and the next read returns it. Only the draft it was sent from is cleared here.
 *
 * Components read it with `useAppSelector` and change it through `actions/mailActions.ts`; the effects in `effects/mailEffects.ts` are the only code that dispatches these reducers.
 */

import { createSlice, type ReducerPayload, type RootState } from '@gears-frontx/react';
import { MAILBOX_INBOX } from '../api/constants';
import type { MailboxId } from '../api/mailTypes';
import type { MailTab } from '../screens/mail/mailSelectors';

// @cpt-dod:cpt-template-inbox-dod-mail-keeps-place:p1
export const MAIL_SLICE = 'inbox/mail';

export type MailState = {
  mailboxId: MailboxId;
  /** The open mail, as the screen last had it (the chat's `selectedId` arrangement). */
  selectedMailId: string | null;
  /** The mailbox still owed an automatic first pick (`useAutoSelect`), or `null`. */
  autoSelectOwedTo: string | null;
  search: string;
  tab: MailTab;
  /**
   * Keyed by mail id rather than a single flag, so switching between two mails with history does not collapse the one already left open.
   */
  historyOpenById: Readonly<Record<string, boolean>>;
  /** Unsent reply text per mail id. */
  drafts: Readonly<Record<string, string>>;
};

export const initialMailState = (): MailState => ({
  mailboxId: MAILBOX_INBOX,
  selectedMailId: null,
  autoSelectOwedTo: MAILBOX_INBOX,
  search: '',
  tab: 'all',
  historyOpenById: {},
  drafts: {},
});

const {
  slice,
  mailboxSelected,
  selectionRemembered,
  searchChanged,
  tabChanged,
  historyToggled,
  draftChanged,
  draftSent,
  mailStateReset,
} = createSlice({
  name: MAIL_SLICE,
  initialState: initialMailState(),
  reducers: {
    // @cpt-begin:cpt-template-inbox-algo-mail-keep-state:p2:inst-store-view-state
    mailboxSelected: (state, action: ReducerPayload<MailboxId>) => {
      state.mailboxId = action.payload;
    },
    selectionRemembered: (state, action: ReducerPayload<{ selectedMailId: string | null; autoSelectOwedTo: string | null }>) => {
      state.selectedMailId = action.payload.selectedMailId;
      state.autoSelectOwedTo = action.payload.autoSelectOwedTo;
    },
    searchChanged: (state, action: ReducerPayload<string>) => {
      state.search = action.payload;
    },
    tabChanged: (state, action: ReducerPayload<MailTab>) => {
      state.tab = action.payload;
    },
    historyToggled: (state, action: ReducerPayload<string>) => {
      const mailId = action.payload;
      state.historyOpenById = { ...state.historyOpenById, [mailId]: !(state.historyOpenById[mailId] ?? false) };
    },
    // @cpt-end:cpt-template-inbox-algo-mail-keep-state:p2:inst-store-view-state
    // @cpt-begin:cpt-template-inbox-algo-mail-keep-state:p2:inst-store-drafts
    draftChanged: (state, action: ReducerPayload<{ mailId: string; draft: string }>) => {
      const { mailId, draft } = action.payload;
      if (state.drafts[mailId] !== draft) state.drafts = { ...state.drafts, [mailId]: draft };
    },
    /**
     * Clears the reply draft of `mailId` once the reply sent from it succeeded, unless the draft was edited since: what is in the box then is a new reply, not the one that went out.
     */
    draftSent: (state, action: ReducerPayload<{ mailId: string; body: string }>) => {
      const { mailId, body } = action.payload;
      if ((state.drafts[mailId] ?? '').trim() === body) state.drafts = { ...state.drafts, [mailId]: '' };
    },
    // @cpt-end:cpt-template-inbox-algo-mail-keep-state:p2:inst-store-drafts
    /** Back to the initial state. */
    mailStateReset: () => initialMailState(),
  },
});

export const mailSlice = slice;
export {
  mailboxSelected,
  selectionRemembered,
  searchChanged,
  tabChanged,
  historyToggled,
  draftChanged,
  draftSent,
  mailStateReset,
};

/** The mail screen's state, for `useAppSelector`. */
export const selectMail = (state: RootState): MailState => state[MAIL_SLICE];

declare module '@gears-frontx/react' {
  interface RootState {
    'inbox/mail': MailState;
  }
}
