import { createElement, type ChangeEventHandler, type ReactNode } from 'react';
import { NativeSelect } from '@gears-frontx/ui-kit';
import { Text } from '@gears-frontx/kit-candidates';
import styles from './PagePicker.module.css';

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export interface PagePickerProps {
  /** The select's id, which its label names. */
  id: string;
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  testId?: string;
  /** The select's option groups and options (the kit's `NativeSelectOptGroup` and `NativeSelectOption`). */
  children: ReactNode;
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

/** The page select a narrow screen shows in place of the navigation panel: a muted caption and the kit's native select across the rest of the row. */
// @cpt-flow:cpt-template-catalogue-flow-catalogue-screen-navigate:p1
// @cpt-algo:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1
// @cpt-dod:cpt-template-catalogue-dod-catalogue-screen-blocks:p1
export function PagePicker({ id, label, value, onChange, testId, children }: PagePickerProps) {
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-choose-panel-or-select
  return (
    <div className={styles.picker}>
      {/* @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
      <Text variant="label" tone="muted" className={styles.label} render={createElement('label', { htmlFor: id })}>
        {label}
      </Text>
      {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
      {/* @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-kit-parts */}
      <NativeSelect id={id} className={styles.select} value={value} onChange={onChange} data-testid={testId}>
        {children}
      </NativeSelect>
      {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-kit-parts */}
    </div>
  );
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-choose-panel-or-select
}
