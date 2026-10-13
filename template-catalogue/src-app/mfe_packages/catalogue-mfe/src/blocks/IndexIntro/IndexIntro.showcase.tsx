import { Input } from '@gears-frontx/ui-kit';
import { IndexIntro } from './IndexIntro';

/** The intro with the kit's search field. */
export default function IndexIntroShowcase() {
  return <IndexIntro intro="Controls, patterns and data views for your application." search={<Input type="search" aria-label="Search" placeholder="Find a component" />} />;
}
