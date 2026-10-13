import { describe, expect, it } from 'vitest';

import * as candidates from './index';

describe('package surface', () => {
  it('exports exactly what ui-kit pull requests A and B propose', () => {
    expect(Object.keys(candidates).sort()).toEqual(
      [
        'Heading', 'headingVariants', 'Text', 'textVariants', 'Link', 'linkVariants', 'VisuallyHidden',
        'CodeBlock', 'CodeBlockHeader', 'CodeBlockTitle', 'CodeBlockCopyButton',
        'DescriptionList', 'DescriptionItem', 'DescriptionTerm', 'DescriptionDetails',
        'Card', 'CardTitle', 'EmptyTitle', 'AlertTitle',
      ].sort(),
    );
  });
});
