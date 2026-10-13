import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';

const { slotProps } = vi.hoisted(() => ({ slotProps: [] as Array<Record<string, unknown>> }));

// The slot attaches a live extension domain, which needs a registry this suite does not build; the stand-in records what the block hands it.
vi.mock('@gears-frontx/react', async (importOriginal) => {
  const real = await importOriginal<Record<string, unknown>>();
  return {
    ...real,
    ExtensionDomainSlot: (props: Record<string, unknown>) => {
      slotProps.push(props);
      return <div data-testid="domain-slot" className={props.className as string} />;
    },
  };
});

const { WidgetSlot } = await import('./WidgetSlot');
const { default: WidgetSlotShowcase } = await import('./WidgetSlot.showcase');

describe('WidgetSlot', () => {
  it('renders the domain slot for the registry and domain it is given, with the attach callback', () => {
    const registry = { id: 'registry' } as never;
    const onAttached = vi.fn();
    render(<WidgetSlot registry={registry} domainId="gts.example.domain.v1~acme.widgets.area.v1" onAttached={onAttached} />);
    const props = slotProps[slotProps.length - 1]!;
    expect(props.registry).toBe(registry);
    expect(props.domainId).toBe('gts.example.domain.v1~acme.widgets.area.v1');
    expect(props.onAttached).toBe(onAttached);
    expect(screen.getByTestId('domain-slot').className).not.toBe('');
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <WidgetSlotShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
