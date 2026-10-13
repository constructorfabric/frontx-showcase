import { createElement } from 'react';
import { PageHeader } from './PageHeader';

/** A component page's header: trail, title with the family on the right, lead. */
export default function PageHeaderShowcase() {
  return (
    <PageHeader
      trail={{ label: 'Breadcrumb', root: 'UI Kit', rootRender: createElement('a', { href: '#index' }), current: 'Button' }}
      title="Button"
      aside={<span>Actions</span>}
      lead="Triggers an action, in primary, secondary, outline, ghost and destructive styles."
    />
  );
}
