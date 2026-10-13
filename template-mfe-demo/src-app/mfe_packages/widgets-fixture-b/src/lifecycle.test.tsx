import type React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeAwareReactLifecycle, type ChildMfeBridge } from '@gears-frontx/react';
import { describe, expect, it } from 'vitest';
import lifecycle from './lifecycle';

type Hooks = { renderContent: (bridge: ChildMfeBridge) => React.ReactNode };

describe('widgets-fixture-b lifecycle', () => {
  it('is the theme-aware lifecycle, exported as the module default', () => {
    expect(lifecycle).toBeInstanceOf(ThemeAwareReactLifecycle);
  });

  it('renders the widget frame', () => {
    const renderContent = (lifecycle as unknown as Hooks).renderContent;
    render(<>{renderContent.call(lifecycle, {} as ChildMfeBridge)}</>);
    const frame = screen.getByText('Widget B (fixture-b)').closest('[data-fixture-id]');
    expect(frame?.getAttribute('data-fixture-id')).toBe('widgets-fixture-b');
    expect(frame?.className).not.toBe('');
    expect(screen.getByText('Mounted concurrently in the widgets domain.')).toBeTruthy();
  });
});
