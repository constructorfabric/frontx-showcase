import { NativeSelectOptGroup, NativeSelectOption } from '@gears-frontx/ui-kit';
import { PagePicker } from './PagePicker';

/** The select on the index, with two groups of pages. */
export default function PagePickerShowcase() {
  return (
    <PagePicker id="showcase-page-select" label="UI Kit page" value="/" onChange={() => undefined}>
      <NativeSelectOptGroup label="Components">
        <NativeSelectOption value="/">All components</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Actions">
        <NativeSelectOption value="/components/button">Button</NativeSelectOption>
      </NativeSelectOptGroup>
    </PagePicker>
  );
}
