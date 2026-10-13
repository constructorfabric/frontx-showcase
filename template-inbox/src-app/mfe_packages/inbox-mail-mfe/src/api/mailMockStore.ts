/**
 * The mail mock backend's state, kept in this module: the mail package's own,
 * as every package keeps its mock state (`shared/inbox/api/mockStore.ts`).
 * The mail it holds is still there when the screen unmounts and mounts
 * again, the way a backend keeps what it was sent.
 *
 * It stands for the server only: what the screen keeps for itself lives in
 * its FrontX slice, and what it has read lives in the shared query cache,
 * which a send invalidates. Created lazily from the seed by the first reader
 * and never serialized: the mock map answers with clones. A page reload
 * starts over from the seed.
 */

import { mails as seedMails } from './mailDataset';
import type { Mail } from './mailTypes';

export type MailMockState = {
  /** Every mail, the seed's and the ones sent this page. */
  mails: Mail[];
  /** The server-side id sequence for sent mail. */
  sentMailCount: number;
};

let state: MailMockState | undefined;

/** The package's mail state, created from the seed if nothing has read it yet. */
export function readMailMockState(): MailMockState {
  // @cpt-algo:cpt-template-inbox-algo-mail-package-state:p2
  // @cpt-begin:cpt-template-inbox-algo-mail-package-state:p2:inst-read-existing
  if (state !== undefined) return state;
  // @cpt-end:cpt-template-inbox-algo-mail-package-state:p2:inst-read-existing
  // @cpt-begin:cpt-template-inbox-algo-mail-package-state:p2:inst-create-from-seed
  const created: MailMockState = { mails: structuredClone(seedMails), sentMailCount: 0 };
  state = created;
  return created;
  // @cpt-end:cpt-template-inbox-algo-mail-package-state:p2:inst-create-from-seed
}

/** Back to the seed and a fresh id sequence. For tests, between cases. */
export const resetMailMockState = (): void => {
  state = undefined;
};
