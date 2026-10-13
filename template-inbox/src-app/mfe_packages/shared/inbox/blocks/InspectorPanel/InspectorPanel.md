# InspectorPanel

A 19rem panel beside a thread with tabs over scrolling bodies: the chat's customer details and assistant tabs.

- **Parts**: `InspectorPanel` (an `aside` landmark named by a second-level heading read by assistive technology only, the kit candidate `VisuallyHidden`, so a kit `Accordion`'s third-level headings inside it keep the outline in order; kit `Tabs`, the line `TabsList` and one scrolling body per tab, its parts `--space-4` apart), `InspectorStack` (a column of a few controls, or a title over its line, `--space-2` apart).
- **Props**: content only: `label`, `tabs[{value, label, content}]`; `children`.
- **Layout**: a fixed 19rem column beside the thread from the chat-details width; under it (`@container inbox-screen (width < 68rem)`) the panel gives its column back.
- **Visual declarations** (`styles-exemptions.json`): the inline-start rule and the 19rem width. They wait for kit pane chrome (a side pane).
- **Used by**: `CustomerDetailsPanel` (chat).
- **Test**: `inbox-contacts-mfe/src/shared-inbox/blocks/InspectorPanel.test.tsx`.
