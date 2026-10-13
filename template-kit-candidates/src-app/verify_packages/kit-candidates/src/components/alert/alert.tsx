'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { AlertTitle as KitAlertTitle, type AlertTitleProps as KitAlertTitleProps } from '@gears-frontx/ui-kit';
import { cx } from 'class-variance-authority';

import { kitClassName } from '../../kit-parts/kitClassName.js';
import styles from './alert.module.css';

/*
 * `render` on the kit's AlertTitle, as ui-kit pull request B proposes it:
 * without `render` the markup is the kit's, byte for byte; with it the given
 * element (a heading, typically) takes the kit's title class. Every other
 * Alert part comes from the kit unchanged.
 */
export type AlertTitleProps = useRender.ComponentProps<'div'>;

// @cpt-dod:cpt-template-kit-candidates-dod-code-and-description-render-on-parts:p1
// @cpt-algo:cpt-template-kit-candidates-algo-code-and-description-render-part:p1
export function AlertTitle({ className, render, ...props }: AlertTitleProps) {
  // @cpt-begin:cpt-template-kit-candidates-algo-code-and-description-render-part:p1:inst-mark-interactive
  const classes = kitClassName<KitAlertTitleProps>(KitAlertTitle, { className: cx(render && styles.renderedTitle, className) });
  // @cpt-end:cpt-template-kit-candidates-algo-code-and-description-render-part:p1:inst-mark-interactive
  // @cpt-begin:cpt-template-kit-candidates-algo-code-and-description-render-part:p1:inst-render-element
  return useRender({ defaultTagName: 'div', render, props: mergeProps<'div'>({ className: classes }, props) });
  // @cpt-end:cpt-template-kit-candidates-algo-code-and-description-render-part:p1:inst-render-element
}
