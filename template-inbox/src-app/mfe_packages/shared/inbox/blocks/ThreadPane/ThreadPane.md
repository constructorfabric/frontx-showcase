# ThreadPane

The open conversation or mail: a column of header, transcript and composer that lays out by its own width (it is the unnamed size container its parts query).

- **Parts**: `ThreadPane` (the column); `ThreadPaneToolbar` (a 3.5rem row of `leading`, `start` and `end` actions, the mail's); `ThreadPaneHeader` (`leading` back button and avatar, the `heading`, a `subtitle` and an optional `detail` line on the kit candidate `Text` meta role, `actions`); `ThreadTranscript` (the kit `MessageScroller` with its viewport and content, `after` for the jump-to-newest button; the caller keeps the keyed `MessageScrollerProvider`); `ThreadSuggestions` (a labelled group of kit outline `Button` chips); `ThreadPlainText` (a body on the kit candidate `Text` body role keeping its line breaks).
- **Props**: content and behaviour only.
- **Layout**: the header puts the actions on a line of their own under 32rem of pane; under 20rem the toolbar wraps; the transcript pads `--space-4` and spaces its messages `--space-4`.
- **Visual declarations** (`styles-exemptions.json`): the toolbar's height and the header and toolbar bottom rules (kit pane chrome), the suggestion chip's `--radius-xl` (a kit `Suggestion` part), the scroller's `box-sizing` (kit defect, upstream draft kit-bugs/04).
- **Used by**: `ConversationThread` (chat), `MailReadingPane` (mail).
- **Test**: `inbox-contacts-mfe/src/shared-inbox/blocks/ThreadPane.test.tsx`.
