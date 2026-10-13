# PaneState

The pane a screen, a list or a detail area shows instead of its content: the loading state, a load error, an empty selection, the not-found page.

- **Use when** a pane has nothing of its own to show yet or any more and says why in its place.
- **Parts**: one kit state component as `children`: `Spinner` (loading, with `role="status"` and `aria-busy` on the pane), `Alert variant="destructive"` (load or render error), `Empty` (nothing selected, nothing found). A title that is the screen's heading uses the kit candidate `EmptyTitle` or `AlertTitle` with `render` (`shared/inbox/ui/ScreenHeading.tsx` as the element).
- **Props**: content and behaviour only: `children`, `role`, `aria-busy`, `data-testid`.
- **Layout**: fills its flex row (`flex: 1`) and centres its content with `--space-6` around it. No visual declaration.
- **Used by**: `LoadingPane`, `LoadErrorPane`, `ScreenNotFound`, `ScreenErrorBoundary`, the chat and mail empty selection, the contact-not-found page.
- **Test**: `inbox-contacts-mfe/src/shared-inbox/blocks/PaneState.test.tsx`.
