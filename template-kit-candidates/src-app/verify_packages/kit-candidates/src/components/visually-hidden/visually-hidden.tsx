'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cx } from 'class-variance-authority';

import styles from './visually-hidden.module.css';

/*
 * Text a screen reader reads and the screen does not show: the name of an
 * icon-only control, a table caption, a skip target's label. The same
 * declarations the kit repeats in four component modules, as the one public
 * copy; `sr-only` in utilities.css is the same rule for markup that is not
 * React.
 */
export type VisuallyHiddenProps = useRender.ComponentProps<'span'>;

// @cpt-dod:cpt-template-kit-candidates-dod-typography-and-links-visually-hidden:p1
// @cpt-algo:cpt-template-kit-candidates-algo-typography-and-links-visually-hidden:p1
export function VisuallyHidden({ className, render, ...props }: VisuallyHiddenProps) {
  // @cpt-begin:cpt-template-kit-candidates-algo-typography-and-links-visually-hidden:p1:inst-hide-box
  return useRender({
    defaultTagName: 'span',
    render,
    props: mergeProps<'span'>({ className: cx(styles.visuallyHidden, className) }, props),
  });
  // @cpt-end:cpt-template-kit-candidates-algo-typography-and-links-visually-hidden:p1:inst-hide-box
}
