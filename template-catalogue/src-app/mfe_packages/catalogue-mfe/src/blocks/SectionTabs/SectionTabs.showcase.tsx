import { SectionTabs } from './SectionTabs';

/** Two sections, the first one's page open. */
export default function SectionTabsShowcase() {
  return (
    <SectionTabs
      label="UI Kit sections"
      tabs={[
        { id: 'components', label: 'Components', href: '#components', current: 'page' },
        { id: 'foundations', label: 'Foundations', href: '#foundations' },
      ]}
    />
  );
}
