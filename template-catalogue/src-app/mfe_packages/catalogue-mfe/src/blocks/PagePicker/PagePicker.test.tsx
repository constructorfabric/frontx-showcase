import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../../test-support/axe';
import PagePickerShowcase from './PagePicker.showcase';

describe('PagePicker', () => {
  it('names the select by its caption and shows the chosen page', async () => {
    const { container } = render(<PagePickerShowcase />);
    expect(screen.getByLabelText('UI Kit page')).toHaveProperty('value', '/');
    await expectNoAxeViolations(container);
  });
});
