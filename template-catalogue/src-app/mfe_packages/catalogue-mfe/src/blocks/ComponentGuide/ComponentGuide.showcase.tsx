import { ArrowUpRightIcon } from 'lucide-react';
import { CodeSample } from '../CodeSample';
import { IconLink } from '../IconLink';
import { ComponentGuide, GuideColumn } from './ComponentGuide';

/** The guide of a component page: the install column and the contract column. */
export default function ComponentGuideShowcase() {
  return (
    <ComponentGuide>
      <GuideColumn
        id="showcase-use"
        title="Use in your app"
        code={<CodeSample title="Install" code="npm install @gears-frontx/ui-kit@0.4.0" copyLabel="Copy" copiedLabel="Copied" />}
        note="Import the theme once at the root of your application."
        link={<IconLink href="#download" trailingIcon={<ArrowUpRightIcon aria-hidden="true" size={14} />}>Download the example</IconLink>}
      />
      <GuideColumn
        id="showcase-contract"
        title="Component contract"
        note="The type definitions the installed version publishes."
        link={<IconLink href="#types" trailingIcon={<ArrowUpRightIcon aria-hidden="true" size={14} />}>Type definitions</IconLink>}
      />
    </ComponentGuide>
  );
}
