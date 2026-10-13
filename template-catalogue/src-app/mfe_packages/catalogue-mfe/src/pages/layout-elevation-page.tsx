import { useRef, type ReactNode } from 'react';

import { Section } from '../shared';
import { useTokenValues } from './token-utils';

// Every step of the published radius scale, plus the bare --radius base a
// consumer overrides to move all of them at once.
const RADII = ['', '-xs', '-sm', '-md', '-lg', '-xl', '-2xl'];
// No --space-7 - theme.css's own comment: "the step number is the value in
// 4px units, so there is no space/7".
const SPACES = ['1', '2', '3', '4', '5', '6', '8'];
const CONTROL_HEIGHTS = ['sm', 'md', 'lg'];
const ICON_SIZES = ['xs', 'sm', 'md', 'lg'];
const BORDER_WIDTHS = ['border-width', 'border-width-focus'];

const LAYOUT_TOKENS = [
  ...RADII.map((step) => `radius${step}`),
  ...SPACES.map((step) => `space-${step}`),
  ...CONTROL_HEIGHTS.map((step) => `control-height-${step}`),
  ...ICON_SIZES.map((step) => `icon-size-${step}`),
  ...BORDER_WIDTHS,
];

// theme.css defines no generic --shadow scale - only these two shadow/scrim
// tokens exist (see the report for the gap against the design source's 4-specimen
// Elevation board). --popover-border isn't listed on its own: it is the
// color --popover-shadow is composed from, not a shadow value itself.
const ELEVATION_TOKENS = ['overlay-modal', 'overlay-panel', 'overlay-panel-blur', 'popover-shadow'];

// A token name or value is one long unbroken run ("Dialog/DropdownMenu/Select/Toast",
// "calc(.625rem - 6px)"). In a phone's half-width column its min-content widened the
// card past its column by up to 93px; breaking anywhere keeps every label inside its box.
const WRAP = { overflowWrap: 'anywhere' } as const;

function LayoutRow({
  token,
  preview,
  value,
}: {
  token: string;
  preview: ReactNode;
  value?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
      <div style={{ width: 64, flexShrink: 0, display: 'flex', alignItems: 'center' }}>{preview}</div>
      <div style={{ display: 'grid', gap: 2, minWidth: 0 }}>
        <code style={{ ...WRAP, fontSize: 'var(--text-label-size)' }}>--{token}</code>
        <code style={{ ...WRAP, fontSize: 'var(--text-meta-size)', color: 'var(--muted-foreground)' }}>{value}</code>
      </div>
    </div>
  );
}

export function LayoutElevationPage() {
  const anchorRef = useRef<HTMLDivElement>(null);
  const layoutValues = useTokenValues(LAYOUT_TOKENS, anchorRef);
  const elevationValues = useTokenValues(ELEVATION_TOKENS, anchorRef);

  return (
    <>
      <Section title="Layout tokens">
        <div
          ref={anchorRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {SPACES.map((step) => (
            <LayoutRow
              key={`space-${step}`}
              token={`space-${step}`}
              value={layoutValues[`space-${step}`]}
              preview={
                <div
                  style={{
                    width: `var(--space-${step})`,
                    height: 16,
                    background: 'var(--primary)',
                    borderRadius: 'var(--radius-xs)',
                  }}
                />
              }
            />
          ))}
          {RADII.map((step) => (
            <LayoutRow
              key={`radius${step}`}
              token={`radius${step}`}
              value={layoutValues[`radius${step}`]}
              preview={
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: `var(--radius${step})`,
                    border: 'var(--border-width) solid var(--border-strong)',
                    background: 'var(--surface)',
                  }}
                />
              }
            />
          ))}
          {CONTROL_HEIGHTS.map((step) => (
            <LayoutRow
              key={`control-height-${step}`}
              token={`control-height-${step}`}
              value={layoutValues[`control-height-${step}`]}
              preview={
                <div
                  style={{
                    width: 56,
                    height: `var(--control-height-${step})`,
                    borderRadius: 'var(--radius-md)',
                    border: 'var(--border-width) solid var(--border-strong)',
                    background: 'var(--surface-elevated)',
                  }}
                />
              }
            />
          ))}
          {ICON_SIZES.map((step) => (
            <LayoutRow
              key={`icon-size-${step}`}
              token={`icon-size-${step}`}
              value={layoutValues[`icon-size-${step}`]}
              preview={
                <div
                  style={{
                    width: `var(--icon-size-${step})`,
                    height: `var(--icon-size-${step})`,
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--muted-foreground)',
                  }}
                />
              }
            />
          ))}
          {BORDER_WIDTHS.map((token) => (
            <LayoutRow
              key={token}
              token={token}
              value={layoutValues[token]}
              preview={
                <div
                  style={{
                    width: 56,
                    height: `var(--${token})`,
                    background: 'var(--foreground)',
                  }}
                />
              }
            />
          ))}
        </div>
      </Section>

      <Section title="Elevation">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gap: 'var(--space-3)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--muted)',
            }}
          >
            <code style={{ ...WRAP, fontSize: 'var(--text-meta-size)', color: 'var(--muted-foreground)' }}>
              --popover-shadow · Dialog/DropdownMenu/Select/Toast chrome
            </code>
            <div
              style={{
                height: 64,
                borderRadius: 'var(--radius-md)',
                background: 'var(--popover)',
                boxShadow: 'var(--popover-shadow)',
              }}
            />
            <code style={{ ...WRAP, fontSize: 'var(--text-meta-size)', color: 'var(--muted-foreground)' }}>
              {elevationValues['popover-shadow']}
            </code>
          </div>

          <div
            style={{
              display: 'grid',
              gap: 'var(--space-3)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              position: 'relative',
            }}
          >
            <code style={{ ...WRAP, fontSize: 'var(--text-meta-size)', color: 'var(--primary-foreground)' }}>
              --overlay-modal · Dialog backdrop scrim
            </code>
            <div
              style={{
                height: 64,
                borderRadius: 'var(--radius-md)',
                background: 'var(--overlay-modal)',
              }}
            />
            <code style={{ ...WRAP, fontSize: 'var(--text-meta-size)', color: 'var(--primary-foreground)' }}>
              {elevationValues['overlay-modal']}
            </code>
          </div>
        </div>
      </Section>
    </>
  );
}
