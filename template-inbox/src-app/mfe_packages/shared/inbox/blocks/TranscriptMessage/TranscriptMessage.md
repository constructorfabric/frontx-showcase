# TranscriptMessage

The bubble of a chat message, inside the kit's `Message` (`MessageAvatar`, `MessageContent`, `MessageHeader`) that the thread composes around it.

- **Parts**: `TranscriptBubble` (the kit `Bubble` and `BubbleContent`; attachments, the text and the meta inside), `TranscriptImageBubble` (the same bubble with a full-bleed image and a caption, or the time on a scrim over a caption-less image), `TranscriptMeta` (the time of day and the read or delivered receipt, docked at the bubble's end edge), `TranscriptAttachment` (the kit `Attachment` with an icon, a name and a size). Links in a message body are the kit candidate `Link variant="inherit"`.
- **Props**: content only: `align`, `variant`, `children`; `src`, `alt`, `caption`, `time`, `receipt{read, label}`; `icon`, `name`, `size`.
- **Visual declarations** (`styles-exemptions.json`): the in-bubble time (meta size, tabular figures), the tick opacities, the bottom tail corners, the full-bleed image's radius, the scrim chip, the caption size. They wait for the kit's Bubble to grow a trailing meta slot (a `MessageFooter` inside the bubble), a `tail` side, an image media part and an attachment overlay slot.
- **Used by**: `ConversationThread` (chat).
- **Test**: `inbox-contacts-mfe/src/shared-inbox/blocks/TranscriptMessage.test.tsx`.
