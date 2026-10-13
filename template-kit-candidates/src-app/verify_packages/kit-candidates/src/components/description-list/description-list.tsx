import { cva, cx, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import styles from './description-list.module.css';

/*
 * A list of name and value pairs on real `dl`/`dt`/`dd`, so assistive
 * technology keeps the term-to-value relation. `DescriptionItem` is the
 * `div` grouping HTML allows inside `dl`. No `render` on the parts: the
 * elements are the point of the component.
 */
// @cpt-dod:cpt-template-kit-candidates-dod-code-and-description-description-list:p1
// @cpt-algo:cpt-template-kit-candidates-algo-code-and-description-pairs:p1
// @cpt-begin:cpt-template-kit-candidates-algo-code-and-description-pairs:p1:inst-list-classes
const descriptionListVariants = cva(styles.descriptionList, {
  variants: {
    orientation: {
      vertical: styles.orientationVertical,
      horizontal: styles.orientationHorizontal,
    },
    size: {
      default: styles.sizeDefault,
      sm: styles.sizeSm,
    },
  },
  defaultVariants: {
    orientation: 'vertical',
    size: 'default',
  },
});
// @cpt-end:cpt-template-kit-candidates-algo-code-and-description-pairs:p1:inst-list-classes

// @cpt-begin:cpt-template-kit-candidates-algo-code-and-description-pairs:p1:inst-details-variant
const descriptionDetailsVariants = cva(styles.descriptionDetails, {
  variants: {
    variant: {
      default: styles.variantDefault,
      mono: styles.variantMono,
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
// @cpt-end:cpt-template-kit-candidates-algo-code-and-description-pairs:p1:inst-details-variant

export interface DescriptionListProps extends ComponentProps<'dl'>, VariantProps<typeof descriptionListVariants> {}

export function DescriptionList({ className, orientation, size, ...props }: DescriptionListProps) {
  // @cpt-begin:cpt-template-kit-candidates-algo-code-and-description-pairs:p1:inst-render-dl
  return (
    <dl
      className={descriptionListVariants({ orientation: orientation ?? 'vertical', size: size ?? 'default', className })}
      {...props}
    />
  );
  // @cpt-end:cpt-template-kit-candidates-algo-code-and-description-pairs:p1:inst-render-dl
}

export type DescriptionItemProps = ComponentProps<'div'>;

export function DescriptionItem({ className, ...props }: DescriptionItemProps) {
  // @cpt-begin:cpt-template-kit-candidates-algo-code-and-description-pairs:p1:inst-render-dl
  return <div className={cx(styles.descriptionItem, className)} {...props} />;
  // @cpt-end:cpt-template-kit-candidates-algo-code-and-description-pairs:p1:inst-render-dl
}

export type DescriptionTermProps = ComponentProps<'dt'>;

export function DescriptionTerm({ className, ...props }: DescriptionTermProps) {
  // @cpt-begin:cpt-template-kit-candidates-algo-code-and-description-pairs:p1:inst-render-dl
  return <dt className={cx(styles.descriptionTerm, className)} {...props} />;
  // @cpt-end:cpt-template-kit-candidates-algo-code-and-description-pairs:p1:inst-render-dl
}

export interface DescriptionDetailsProps extends ComponentProps<'dd'>, VariantProps<typeof descriptionDetailsVariants> {}

export function DescriptionDetails({ className, variant, ...props }: DescriptionDetailsProps) {
  // @cpt-begin:cpt-template-kit-candidates-algo-code-and-description-pairs:p1:inst-details-variant
  return <dd className={descriptionDetailsVariants({ variant: variant ?? 'default', className })} {...props} />;
  // @cpt-end:cpt-template-kit-candidates-algo-code-and-description-pairs:p1:inst-details-variant
}
