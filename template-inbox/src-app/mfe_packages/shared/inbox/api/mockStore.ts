/**
 * The mock backend's state of one screen package.
 *
 * It lives in this module, so every package that bundles it keeps its own
 * copy, created from the same seed: no package reads another's state, and
 * data passes between screens only through FrontX's mechanisms (shared
 * properties, actions chains and the shared query cache, where one package's
 * answer can paint on another screen until that screen's refetch answers),
 * never through a page-wide object. Within a package the state outlives a
 * mount, the way a backend keeps what it was told: a reply posted in chat is
 * still in the transcript after chat unmounts and mounts again. It stands for
 * the server only: what a screen keeps for itself lives in that screen's
 * FrontX slice, and what a screen has read lives in the shared query cache,
 * which a write invalidates.
 *
 * The object is created lazily from the seed by the package's first read, and
 * never serialized: factories answer with clones (`readInboxMockState` hands
 * out the live object only to the mock maps, which clone on the way out). A
 * page reload starts over from the seed.
 */

import { contacts as seedContacts, conversations as seedConversations, messages as seedMessages } from './dataset';
import type { Contact, Conversation, Message } from './types';

export type InboxMockState = {
  /**
   * The people the package's screens refer to: the contacts directory lists
   * them, and the conversations point at them by id.
   */
  contacts: Contact[];
  conversations: Conversation[];
  messages: Message[];
  /** Server-side id sequences for what this page created. */
  postedMessageCount: number;
  createdConversationCount: number;
};

// @cpt-begin:cpt-template-inbox-algo-data-package-state:p1:inst-seed-state
const createInboxMockState = (): InboxMockState => ({
  contacts: structuredClone(seedContacts),
  conversations: structuredClone(seedConversations),
  messages: structuredClone(seedMessages),
  postedMessageCount: 0,
  createdConversationCount: 0,
});
// @cpt-end:cpt-template-inbox-algo-data-package-state:p1:inst-seed-state

let state: InboxMockState | undefined;

/** The package's mock state, created from the seed if nothing has read it yet. */
// @cpt-dod:cpt-template-inbox-dod-data-package-state:p1
// @cpt-algo:cpt-template-inbox-algo-data-package-state:p1
// @cpt-state:cpt-template-inbox-state-data-package-mock-state:p2
export function readInboxMockState(): InboxMockState {
  // @cpt-begin:cpt-template-inbox-algo-data-package-state:p1:inst-look-up-state
  const existing = state;
  // @cpt-end:cpt-template-inbox-algo-data-package-state:p1:inst-look-up-state
  // @cpt-begin:cpt-template-inbox-algo-data-package-state:p1:inst-seed-state
  if (existing === undefined) {
    // @cpt-begin:cpt-template-inbox-state-data-package-mock-state:p2:inst-seed-on-first-read
    const created = createInboxMockState();
    state = created;
    return created;
    // @cpt-end:cpt-template-inbox-state-data-package-mock-state:p2:inst-seed-on-first-read
  }
  // @cpt-end:cpt-template-inbox-algo-data-package-state:p1:inst-seed-state
  // @cpt-begin:cpt-template-inbox-algo-data-package-state:p1:inst-return-state
  return existing;
  // @cpt-end:cpt-template-inbox-algo-data-package-state:p1:inst-return-state
}

/** Back to the seed and fresh id sequences. For tests, between cases. */
export const resetInboxMockState = (): void => {
  // @cpt-begin:cpt-template-inbox-state-data-package-mock-state:p2:inst-reset-state
  state = undefined;
  // @cpt-end:cpt-template-inbox-state-data-package-mock-state:p2:inst-reset-state
};
