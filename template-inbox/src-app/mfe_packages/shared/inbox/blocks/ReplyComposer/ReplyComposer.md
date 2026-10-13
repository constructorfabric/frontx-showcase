# ReplyComposer

The reply area at the foot of a thread: the chat's reply and note box, the mail's reply box.

- **Parts**: `ReplyComposer` (the ruled-off area; a `notice` such as the kit `Alert` for a failed post), `ReplyComposerTabs` (kit `Tabs` with the line `TabsList`, the same box under every tab), `ReplyComposerBox` (the `field`, a kit `Textarea`; the row under it with `tools`, the `hint` on the kit candidate `Text` meta role and the `send` button; `note` frames it in the warning colour).
- **Props**: content and behaviour only.
- **Layout**: under 20rem of thread the area and the box give back their padding and the row's controls are clipped to the line.
- **Visual declarations** (`styles-exemptions.json`): the top rule, the box's transparent frame and radius, the note's warning frame. They wait for kit pane chrome and a `tone` on the kit's `InputGroup` (the box is the kit's InputGroup role, but its frame would draw a second border around the Textarea's own).
- **Used by**: `Composer` (chat), `MailComposer` (mail).
- **Test**: `inbox-contacts-mfe/src/shared-inbox/blocks/ReplyComposer.test.tsx`.
