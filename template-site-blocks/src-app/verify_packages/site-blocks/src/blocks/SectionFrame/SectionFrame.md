# SectionFrame

The frame every landing-page section shares: a full-bleed band whose content is held to the page column, the section's label and title at the start, its note, lead and link at the end aligned to the title's last line, and the section's body under the header.

## When to use

- Inside a landing-page block (features, architecture map, kit showcase, steps and the like), around that block's body.

## When not to use

- On an inner page: use `DocsFrame` or `DocsFrameWithRail` and `SectionHeading`.
- For a section whose header the design draws another way (the title alone, the link at the far end, the lead under the title): that is another block.

## Props

| Prop | Type | Content |
|------|------|---------|
| `id` | `string` | The title's id; the band is a region named by it |
| `title` | `string` | The section title; a newline breaks the line |
| `label` | `string?` | A short label above the title |
| `note` | `string?` | A small line above the lead that says what the body is |
| `lead` | `string?` | The lead beside the title |
| `action` | `ReactNode?` | A link under the lead, such as a kit candidate `Link` |
| `children` | `ReactNode` | The section body |

## Kit parts

- Title: kit candidate `Heading` (`h2`) on the display role, its role tokens set to the brand's section size (`--site-text-section-*`).
- Label, note, lead: kit candidate `Text` (meta role; muted tone).

## Layout

- Block padding from `--site-section-pad-top` and `--site-section-pad-bottom`; a composing block sets its own pair on an ancestor element, so the frame has no rhythm prop.
- Header: two columns (`1.1fr` and `1fr`), gap `--site-heading-gap`, aligned to the end; one column under 640 pixels. The end column is at most `--site-lead-column` wide. The space under the header is `--site-header-space` (32px; 24px under 640 pixels).
- Arrangement tokens a composing block may set on an ancestor: `--site-column-display`, `--site-header-display`, `--site-aside-display` and `--site-action-order`. Their defaults keep the header above; set to `flex`, `contents`, `contents` and an order, they flatten the header into the column so the composing block's own body parts can sit between the title and the action (ChangeStory on a phone).

## States

- No end column when there is no note, lead or action.

## Design section

The V2 home sections' header row: eyebrow and H2 at the start, lead (420 wide) at the end, as on "One shell. Independent screens." (padding 52/64 at 1440, 36/40 at 390; H2 46.08px at 1440, 31px at 390).

## Accessibility

- The band is a `section` labelled by its title; one level-two heading per band.
