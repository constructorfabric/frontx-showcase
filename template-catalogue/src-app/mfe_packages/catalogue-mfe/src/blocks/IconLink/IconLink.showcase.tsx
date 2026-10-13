import { ArrowLeftIcon, ArrowUpRightIcon } from 'lucide-react';
import { IconLink } from './IconLink';

/** The way back and a text link with an arrow. */
export default function IconLinkShowcase() {
  return (
    <div>
      <IconLink variant="muted" href="#index" icon={<ArrowLeftIcon aria-hidden="true" size={15} />}>
        All components
      </IconLink>
      <IconLink href="#types" trailingIcon={<ArrowUpRightIcon aria-hidden="true" size={14} />} testId="showcase-types">
        Type definitions
      </IconLink>
    </div>
  );
}
