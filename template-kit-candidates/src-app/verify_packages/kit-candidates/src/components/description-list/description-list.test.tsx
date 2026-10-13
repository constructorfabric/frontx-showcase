import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from './description-list';
import styles from './description-list.module.css';

const moduleCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'description-list.module.css'), 'utf8');

function Facts(props: { orientation?: 'vertical' | 'horizontal'; size?: 'default' | 'sm' }) {
  return (
    <DescriptionList data-testid="list" orientation={props.orientation} size={props.size}>
      <DescriptionItem>
        <DescriptionTerm>Owner</DescriptionTerm>
        <DescriptionDetails>Platform team</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Path</DescriptionTerm>
        <DescriptionDetails variant="mono">src/app/main.tsx</DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  );
}

describe('DescriptionList', () => {
  it('renders dl > div > dt + dd', () => {
    render(<Facts />);
    const list = screen.getByTestId('list');
    expect(list.tagName).toBe('DL');
    const items = Array.from(list.children);
    expect(items.map((item) => item.tagName)).toEqual(['DIV', 'DIV']);
    expect(Array.from(items[0].children).map((child) => child.tagName)).toEqual(['DT', 'DD']);
    expect(items[0].className).toContain(styles.descriptionItem);
    expect(screen.getByText('Owner').className).toContain(styles.descriptionTerm);
    expect(screen.getByText('Platform team').className).toContain(styles.descriptionDetails);
  });

  it('defaults to vertical and the default size', () => {
    render(<Facts />);
    const list = screen.getByTestId('list');
    expect(list.className).toContain(styles.orientationVertical);
    expect(list.className).toContain(styles.sizeDefault);
  });

  it.each([
    ['horizontal', 'default', styles.orientationHorizontal, styles.sizeDefault],
    ['vertical', 'sm', styles.orientationVertical, styles.sizeSm],
  ] as const)('applies %s and %s', (orientation, size, orientationClass, sizeClass) => {
    render(<Facts orientation={orientation} size={size} />);
    const list = screen.getByTestId('list');
    expect(list.className).toContain(orientationClass);
    expect(list.className).toContain(sizeClass);
  });

  it('paints a value in mono through its variant', () => {
    render(<Facts />);
    expect(screen.getByText('src/app/main.tsx').className).toContain(styles.variantMono);
    expect(screen.getByText('Platform team').className).toContain(styles.variantDefault);
  });

  it('aligns horizontal terms in one column and draws from tokens only', () => {
    expect(moduleCss).toMatch(/\.orientationHorizontal\s*\{[^}]*grid-template-columns:\s*max-content minmax\(0, 1fr\);/);
    expect(moduleCss).toMatch(/\.orientationHorizontal \.descriptionItem\s*\{[^}]*grid-template-columns:\s*subgrid;/);
    expect(moduleCss).toMatch(/\.descriptionTerm\s*\{[^}]*color:\s*var\(--muted-foreground\);/);
    expect(moduleCss).toMatch(/\.descriptionDetails\s*\{[^}]*margin:\s*0;/);
    expect(moduleCss).not.toMatch(/#[0-9a-f]{3,8}\b|\d+px/i);
  });

  it('passes axe in both orientations', async () => {
    const { container } = render(
      <div>
        <Facts />
        <Facts orientation="horizontal" size="sm" />
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});
