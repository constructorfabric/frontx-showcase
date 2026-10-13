'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';

import styles from './heading.module.css';

/*
 * A heading on the kit's type ramp: `size` picks the ramp role, `render`
 * picks the element, so the document outline (h1 to h6) and the look stay
 * independent. No Base UI primitive; `render` polymorphism comes from
 * `useRender`/`mergeProps`, as in StatusDot, Badge and Item. Margins are
 * zero: spacing belongs to the layout that places the heading.
 */
// @cpt-dod:cpt-template-kit-candidates-dod-typography-and-links-text-roles:p1
// @cpt-algo:cpt-template-kit-candidates-algo-typography-and-links-ramp-role:p1
// @cpt-begin:cpt-template-kit-candidates-algo-typography-and-links-ramp-role:p1:inst-role-class
const headingVariants = cva(styles.heading, {
  variants: {
    size: {
      display: styles.sizeDisplay,
      'heading-1': styles.sizeHeading1,
      'heading-2': styles.sizeHeading2,
    },
  },
  defaultVariants: {
    size: 'heading-1',
  },
});
// @cpt-end:cpt-template-kit-candidates-algo-typography-and-links-ramp-role:p1:inst-role-class

export interface HeadingProps extends useRender.ComponentProps<'h2'>, VariantProps<typeof headingVariants> {}

export function Heading({ className, size, render, ...props }: HeadingProps) {
  // @cpt-begin:cpt-template-kit-candidates-algo-typography-and-links-ramp-role:p1:inst-resolve-null
  // cva reads an explicit `null` as "emit no class"; resolved once here so
  // `size={null}` lands on the default role, as StatusDot and Item do.
  const resolvedSize = size ?? 'heading-1';
  // @cpt-end:cpt-template-kit-candidates-algo-typography-and-links-ramp-role:p1:inst-resolve-null
  // @cpt-begin:cpt-template-kit-candidates-algo-typography-and-links-ramp-role:p1:inst-render-element
  return useRender({
    defaultTagName: 'h2',
    render,
    props: mergeProps<'h2'>({ className: headingVariants({ size: resolvedSize, className }) }, props),
  });
  // @cpt-end:cpt-template-kit-candidates-algo-typography-and-links-ramp-role:p1:inst-render-element
}

export { headingVariants };
