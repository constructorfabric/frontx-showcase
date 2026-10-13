'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';

import styles from './text.module.css';

/*
 * Text on the kit's type ramp: `variant` is the ramp role (paint and scale
 * are one axis because the ramp couples them), `tone` is the colour. The
 * default element is `p`; `render` swaps it (a `span` inside a row, a
 * `code` for a path). No lead, overline or uppercase variants: those are
 * not ramp roles.
 */
// @cpt-dod:cpt-template-kit-candidates-dod-typography-and-links-text-roles:p1
// @cpt-algo:cpt-template-kit-candidates-algo-typography-and-links-ramp-role:p1
// @cpt-begin:cpt-template-kit-candidates-algo-typography-and-links-ramp-role:p1:inst-role-class
const textVariants = cva(styles.text, {
  variants: {
    variant: {
      body: styles.variantBody,
      label: styles.variantLabel,
      meta: styles.variantMeta,
      mono: styles.variantMono,
      micro: styles.variantMicro,
    },
    tone: {
      default: styles.toneDefault,
      muted: styles.toneMuted,
    },
  },
  defaultVariants: {
    variant: 'body',
    tone: 'default',
  },
});
// @cpt-end:cpt-template-kit-candidates-algo-typography-and-links-ramp-role:p1:inst-role-class

export interface TextProps extends useRender.ComponentProps<'p'>, VariantProps<typeof textVariants> {}

export function Text({ className, variant, tone, render, ...props }: TextProps) {
  // @cpt-begin:cpt-template-kit-candidates-algo-typography-and-links-ramp-role:p1:inst-resolve-null
  const resolvedVariant = variant ?? 'body';
  const resolvedTone = tone ?? 'default';
  // @cpt-end:cpt-template-kit-candidates-algo-typography-and-links-ramp-role:p1:inst-resolve-null
  // @cpt-begin:cpt-template-kit-candidates-algo-typography-and-links-ramp-role:p1:inst-render-element
  return useRender({
    defaultTagName: 'p',
    render,
    props: mergeProps<'p'>({ className: textVariants({ variant: resolvedVariant, tone: resolvedTone, className }) }, props),
  });
  // @cpt-end:cpt-template-kit-candidates-algo-typography-and-links-ramp-role:p1:inst-render-element
}

export { textVariants };
