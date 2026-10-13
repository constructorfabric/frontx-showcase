import { useState } from 'react';

export type AutoSelect = {
  /** Owes `scope` (a channel, a mailbox) an automatic first pick. */
  arm: (scope: string) => void;
  /**
   * The scope still owed a pick, or `null` once it was paid. A screen keeps
   * it in its store beside the selection, so a remount neither re-opens an
   * item the user closed nor forgets a pick it still owes.
   */
  owedTo: string | null;
};

/**
 * Opens the first item of a list on its own - on entering a screen and again
 * on every switch of the list's scope (a channel, a mailbox) - without ever
 * second-guessing an item the user picked, or re-opening one after the user
 * closed it.
 *
 * The pick is owed to one scope at a time and is paid once the list's data
 * has settled, whether or not the list has anything to pick: left owed on an
 * empty list, it would later open an item the user never chose. Paying it
 * opens the first item only while nothing is selected, so a selection made
 * before the list settled (a deep link, a conversation just started) stands.
 * Where it starts is the caller's: `initialOwedTo` comes from the slice the
 * screen keeps its selection in, which is what lets "closed, nothing
 * selected" survive a remount.
 *
 * Resolved during render rather than in an effect: it is derived state
 * (React's "adjust state when something changes" pattern), so settling it a
 * render early avoids a frame of the empty state.
 */
// @cpt-algo:cpt-template-inbox-algo-screen-frame-auto-select:p2
// @cpt-dod:cpt-template-inbox-dod-screen-frame-shared-components:p2
export function useAutoSelect({
  scope,
  settled,
  firstId,
  selectedId,
  onSelect,
  initialOwedTo,
}: {
  scope: string;
  /** The list's data has arrived (or failed); nothing more is coming for this scope. */
  settled: boolean;
  /** The first item of the list as it renders now, if any. */
  firstId: string | undefined;
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** The scope owed a pick when the screen mounts, as its store remembers it. */
  initialOwedTo: string | null;
}): AutoSelect {
  // @cpt-begin:cpt-template-inbox-algo-screen-frame-auto-select:p2:inst-hold-owed
  const [owedTo, setOwedTo] = useState<string | null>(initialOwedTo);
  // @cpt-end:cpt-template-inbox-algo-screen-frame-auto-select:p2:inst-hold-owed

  // @cpt-begin:cpt-template-inbox-algo-screen-frame-auto-select:p2:inst-pay-pick
  if (owedTo === scope && settled) {
    setOwedTo(null);
    if (firstId !== undefined && selectedId === null) onSelect(firstId);
  }
  // @cpt-end:cpt-template-inbox-algo-screen-frame-auto-select:p2:inst-pay-pick

  // @cpt-begin:cpt-template-inbox-algo-screen-frame-auto-select:p2:inst-return-owed
  return { arm: setOwedTo, owedTo };
  // @cpt-end:cpt-template-inbox-algo-screen-frame-auto-select:p2:inst-return-owed
}
