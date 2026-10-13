import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { DocsFrameWithRail } from './DocsFrameWithRail';
import DocsFrameWithRailShowcase from './DocsFrameWithRail.showcase';
import { activeAnchor, jumpToHeading } from './railAnchors';

const intro = { title: 'Run Shell + MFE.', lead: 'Start here.' };
const rail = { label: 'On this page', items: [{ id: 'one', title: 'One' }, { id: 'two', title: 'Two' }] };

function Page() {
  return (
    <DocsFrameWithRail intro={intro} rail={rail} aside={<p>Facts</p>}>
      <h2 id="one" tabIndex={-1}>One</h2>
      <h2 id="two" tabIndex={-1}>Two</h2>
    </DocsFrameWithRail>
  );
}

describe('activeAnchor', () => {
  it('picks the last heading that reached the reading line, or the first while none has', () => {
    expect(activeAnchor([300, 600], 140)).toBe(0);
    expect(activeAnchor([100, 600], 140)).toBe(0);
    expect(activeAnchor([-400, 120], 140)).toBe(1);
    expect(activeAnchor([], 140)).toBe(0);
  });
});

describe('jumpToHeading', () => {
  it('focuses the heading and scrolls it into view', () => {
    render(<Page />);
    const heading = screen.getByRole('heading', { level: 2, name: 'Two' });
    const scroll = vi.fn();
    heading.scrollIntoView = scroll;
    jumpToHeading(heading, 'two');
    expect(document.activeElement).toBe(heading);
    expect(scroll).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('does nothing for an id that is not on the page', () => {
    render(<Page />);
    const before = document.activeElement;
    jumpToHeading(document.body, 'missing');
    expect(document.activeElement).toBe(before);
  });
});

describe('DocsFrameWithRail', () => {
  // jsdom lays nothing out; the headings sit below the reading line, as on a page scrolled to its top.
  beforeEach(() => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      return { top: this.id === 'one' ? 300 : this.id === 'two' ? 600 : 0 } as DOMRect;
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it('renders the rail as a named navigation with a numbered jump per section, the first current', () => {
    render(<Page />);
    const nav = screen.getByRole('navigation', { name: 'On this page' });
    const buttons = Array.from(nav.querySelectorAll('button'));
    expect(buttons.map((button) => button.textContent)).toEqual(['01One', '02Two']);
    expect(buttons[0]?.getAttribute('aria-current')).toBe('location');
    expect(buttons[1]?.getAttribute('aria-current')).toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: 'On this page' })).toBeTruthy();
  });

  it('moves focus to the section a rail button names', () => {
    render(<Page />);
    fireEvent.click(screen.getByRole('button', { name: /Two/ }));
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 2, name: 'Two' }));
  });

  it('puts the aside content in the side column before the rail', () => {
    render(<Page />);
    const side = screen.getByRole('complementary');
    expect(side.firstElementChild?.textContent).toBe('Facts');
    expect(side.querySelector('nav')).toBeTruthy();
  });

  it('passes axe as rendered by its showcase fixture', async () => {
    const { container } = render(
      <main>
        <DocsFrameWithRailShowcase />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
