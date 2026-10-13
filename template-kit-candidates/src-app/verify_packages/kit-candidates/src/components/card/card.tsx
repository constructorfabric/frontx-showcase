'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import {
  Card as KitCard,
  CardTitle as KitCardTitle,
  type CardProps as KitCardProps,
  type CardTitleProps as KitCardTitleProps,
} from '@gears-frontx/ui-kit';
import { cx } from 'class-variance-authority';

import { kitClassName } from '../../kit-parts/kitClassName.js';
import styles from './card.module.css';

/*
 * `render` on the kit's Card and CardTitle, as ui-kit pull request B
 * proposes it. Without `render` the markup is the kit's, byte for byte (same
 * element, same classes, no new attributes). With `render` the given element
 * takes the kit's classes: a Card rendered as a link or a button gains the
 * hover border and the focus ring Item draws; a CardTitle rendered as a
 * heading keeps the kit's title look. Every other Card part comes from the
 * kit unchanged.
 */

export type CardProps = useRender.ComponentProps<'div'> & Pick<KitCardProps, 'size'>;

// @cpt-dod:cpt-template-kit-candidates-dod-code-and-description-render-on-parts:p1
// @cpt-algo:cpt-template-kit-candidates-algo-code-and-description-render-part:p1
export function Card({ className, size, render, ...props }: CardProps) {
  // @cpt-begin:cpt-template-kit-candidates-algo-code-and-description-render-part:p1:inst-mark-interactive
  const classes = kitClassName<KitCardProps>(KitCard, { size, className: cx(render && styles.interactive, className) });
  // @cpt-end:cpt-template-kit-candidates-algo-code-and-description-render-part:p1:inst-mark-interactive
  // @cpt-begin:cpt-template-kit-candidates-algo-code-and-description-render-part:p1:inst-render-element
  return useRender({ defaultTagName: 'div', render, props: mergeProps<'div'>({ className: classes }, props) });
  // @cpt-end:cpt-template-kit-candidates-algo-code-and-description-render-part:p1:inst-render-element
}

export type CardTitleProps = useRender.ComponentProps<'div'> & Pick<KitCardTitleProps, 'typography'>;

export function CardTitle({ className, typography, render, ...props }: CardTitleProps) {
  // @cpt-begin:cpt-template-kit-candidates-algo-code-and-description-render-part:p1:inst-mark-interactive
  const classes = kitClassName<KitCardTitleProps>(KitCardTitle, { typography, className: cx(render && styles.renderedTitle, className) });
  // @cpt-end:cpt-template-kit-candidates-algo-code-and-description-render-part:p1:inst-mark-interactive
  // @cpt-begin:cpt-template-kit-candidates-algo-code-and-description-render-part:p1:inst-render-element
  return useRender({ defaultTagName: 'div', render, props: mergeProps<'div'>({ className: classes }, props) });
  // @cpt-end:cpt-template-kit-candidates-algo-code-and-description-render-part:p1:inst-render-element
}
