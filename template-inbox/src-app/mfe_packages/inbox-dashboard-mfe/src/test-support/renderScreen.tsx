import type { ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { FrontXProvider } from '@gears-frontx/react';
import { frontxWrapper } from '@inbox-shared/test-support/frontxTestHost';
import { mfeApp } from '../init';

/**
 * Renders `ui` inside this package's FrontX provider, the way the lifecycle mounts the screen: the package's store with its slices, and the page's shared query cache. A suite's own `wrapper` goes inside it.
 */
export const renderScreen = (ui: ReactElement, options: RenderOptions = {}) =>
  render(ui, { ...options, wrapper: frontxWrapper(FrontXProvider, mfeApp, options.wrapper) });
