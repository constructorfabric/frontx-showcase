import type { ChangeEvent } from 'react';
import { NativeSelect, NativeSelectOption } from '@gears-frontx/ui-kit';
import styles from './HeaderSelect.module.css';

export interface HeaderSelectProps {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
  'data-testid'?: string;
}

/** A compact select for a header control (theme, language) with the arrow inset fixed for right-to-left text. Fills the kit gap "header select": the kit's NativeSelect pads the arrow with a physical side. */
// @cpt-algo:cpt-site-algo-shell-layout-navigation-page-frame:p1
export function HeaderSelect({ label, value, options, onChange, 'data-testid': testId }: HeaderSelectProps) {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-header
  return (
    <NativeSelect size="sm" className={styles.select} aria-label={label} value={value} onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)} data-testid={testId}>
      {options.map((option) => (
        <NativeSelectOption key={option.value} value={option.value}>
          {option.label}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
  // @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-header
}
