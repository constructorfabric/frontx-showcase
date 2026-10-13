import { fireEvent, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import versions from '../../data/versions.generated.json';
import en from './i18n/en.json';
import { CATALOGUE_SCREEN_EXTENSION, SITE_SCREEN_EXTENSIONS } from '@site-shared/navigation/siteScreens';
import { chainOf, openChain } from '@site-shared/test-support/screenLinks';
import { renderDocsAt } from '../../test-support/renderAt';

vi.mock('@gears-frontx/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@gears-frontx/react')>();
  return {
    ...actual,
    apiRegistry: { getService: () => ({ getVersions: { key: ['site-docs', 'GET', '/versions'] } }) },
    useApiQuery: () => ({ data: versions, isLoading: false, isError: false }),
  };
});

beforeEach(() => {
  vi.stubGlobal('scrollTo', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState(null, '', '/');
});

describe('DocsPage', () => {
  it('renders the get-started steps with commands filled from the version data, one h1 and a link to its plain-text twin', async () => {
    renderDocsAt('/get-started');
    expect(await screen.findByRole('heading', { level: 1, name: en['start.title'] })).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const install = screen.getByRole('heading', { level: 2, name: new RegExp(en['start.install.title']) }).closest('section');
    // The long command continues on the next line after a ` \`, so the shell still reads one command.
    expect(install?.textContent).toContain(`frontx install \\\n  ${versions.vars.shellSpec}`);
    // The twin is linked from the foot of the side panel.
    const rail = screen.getByRole('navigation', { name: en['chrome.onThisPage'] });
    expect(within(rail).getByTestId('page-twin').getAttribute('href')).toBe('./docs/get-started.md');
  });

  it('links the twin of a page without a side panel from the line under its content', async () => {
    renderDocsAt('/');
    expect(await screen.findByRole('heading', { level: 1, name: en['overview.title'] })).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: en['chrome.onThisPage'] })).toBeNull();
    const twin = screen.getByTestId('page-twin');
    expect(twin.getAttribute('href')).toBe('./docs/index.md');
    // The footer line follows the page's content, the last link of the page.
    const page = twin.closest('article');
    const links = page ? within(page).getAllByRole('link') : [];
    expect(links[links.length - 1]).toBe(twin);
  });

  it('names a step file by the name the outline gives it, else by its file name', async () => {
    renderDocsAt('/first-change');
    expect(await screen.findByRole('link', { name: 'i18n/en.json' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'HomeScreen.tsx' })).toBeTruthy();
  });

  it('gives every region of a guide its own name, and wraps step commands instead of scrolling them', async () => {
    renderDocsAt('/first-change');
    await screen.findByRole('heading', { level: 1, name: en['change.title'] });
    const names = screen.getAllByRole('region').map((region) => region.getAttribute('aria-label') ?? document.getElementById(region.getAttribute('aria-labelledby') ?? '')?.textContent);
    expect(new Set(names).size).toBe(names.length);
    // A wrapped command block has nothing to scroll, so it is no focusable region of its own.
    expect(names).not.toContain(`${en['change.check.code']} ${en['chrome.code']}`);
    expect(document.querySelectorAll('pre[tabindex]')).toHaveLength(0);
  });

  it('lists only the numbered steps in the side panel, one of them current, under the title the page names', async () => {
    renderDocsAt('/first-change');
    const rail = await screen.findByRole('navigation', { name: en['change.rail'] });
    const items = within(rail).getAllByRole('button');
    expect(items.map((item) => item.textContent)).toEqual([`01${en['change.find.title']}`, `02${en['change.edit.title']}`, `03${en['change.check.title']}`, `04${en['change.open.title']}`]);
    // Which one is current follows the scroll position, which jsdom does not lay out; activeAnchor's own test covers the choice.
    expect(items.filter((item) => item.getAttribute('aria-current') === 'location')).toHaveLength(1);
  });

  it('collapses the agent task, with its full guide addresses and a link to its plain-text copy', async () => {
    renderDocsAt('/first-change');
    const summary = await screen.findByRole('button', { name: en['change.agent.summary'] });
    expect(summary.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText(en['change.agent.title'])).toBeNull();
    fireEvent.click(summary);
    expect(summary.getAttribute('aria-expanded')).toBe('true');
    expect(await screen.findByText(en['change.agent.title'])).toBeTruthy();
    expect(document.body.textContent).toContain(`${window.location.origin}/docs/first-change.md`);
    expect(screen.getByTestId('task-twin').getAttribute('href')).toBe('./docs/first-change/agent-task.md');
  });

  it('marks the current page in the tab bar, which ends with the libraries screen', async () => {
    const { bridge } = renderDocsAt('/first-change');
    const tabs = await screen.findByRole('navigation', { name: en['tabs.label'] });
    expect(within(tabs).getByRole('link', { name: en['tabs.firstChange'] }).getAttribute('aria-current')).toBe('page');
    expect(chainOf(bridge, within(tabs).getByRole('link', { name: en['tabs.libraries'] }))).toEqual(openChain(SITE_SCREEN_EXTENSIONS.libs));
  });

  it('marks the overview tab on the screen root, and no other tab with it', async () => {
    // The shell writes the page address, so the router sees `/?screen=docs` and not the screen's own `/`.
    renderDocsAt('/?screen=docs');
    const tabs = await screen.findByRole('navigation', { name: en['tabs.label'] });
    expect(within(tabs).getByRole('link', { name: en['tabs.overview'] }).getAttribute('aria-current')).toBe('page');
    expect(within(tabs).getAllByRole('link').filter((link) => link.getAttribute('aria-current') === 'page')).toHaveLength(1);
    // The overview's two sections need no "On this page" rail; the guides keep theirs.
    expect(screen.queryByRole('navigation', { name: en['chrome.onThisPage'] })).toBeNull();
  });

  it('moves keyboard focus to the heading an "On this page" item jumps to', async () => {
    renderDocsAt('/get-started');
    const rail = await screen.findByRole('navigation', { name: en['chrome.onThisPage'] });
    const item = within(rail).getByRole('button', { name: new RegExp(en['start.install.title']) });
    fireEvent.click(item);
    const heading = screen.getByRole('heading', { level: 2, name: new RegExp(en['start.install.title']) });
    expect(document.activeElement).toBe(heading);
    expect(heading.getAttribute('tabindex')).toBe('-1');
  });

  it('wraps a long step command onto continuation lines, with no scroll region to reach', async () => {
    renderDocsAt('/get-started');
    const title = await screen.findByText(en['start.workspace.code']);
    expect(screen.queryByRole('region', { name: en['start.workspace.code'] })).toBeNull();
    expect(title.closest('section')?.querySelector('pre')?.getAttribute('tabindex')).toBeNull();
  });

  it('shows the toolchain chips, the two start paths and the closing band on get-started, with a path card that focuses its step', async () => {
    const { bridge } = renderDocsAt('/get-started');
    await screen.findByRole('heading', { level: 1, name: en['start.title'] });
    expect(screen.getByText(`Node.js ${versions.vars.nodeVersion} · npm ${versions.vars.npmVersion}`)).toBeTruthy();
    expect(screen.getByText(`CLI ${versions.vars.cliVersion}`)).toBeTruthy();
    expect(chainOf(bridge, screen.getByRole('link', { name: new RegExp(en['start.path.existing.title']) }))).toEqual(openChain(SITE_SCREEN_EXTENSIONS.libs));
    fireEvent.click(screen.getByRole('link', { name: new RegExp(en['start.path.new.title']) }));
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 2, name: new RegExp(en['start.workspace.title']) }));
    expect(screen.getByRole('heading', { level: 2, name: en['start.band.title'] })).toBeTruthy();
    expect(screen.getByRole('link', { name: en['start.band.action'] }).getAttribute('href')).toBe('/first-change');
    expect(screen.getByText(en['start.status'])).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: en['start.run.note.title'] })).toBeTruthy();
  });

  it('adds the UI kit and agent cards to the overview, with the AI tooling kit documentation at the packed commit', async () => {
    const { bridge } = renderDocsAt('/');
    const kit = await screen.findByRole('link', { name: new RegExp(en['overview.card.kit.title']) });
    // The overview's paths come first, with no section heading of their own: the one section heading follows the path cards' titles.
    const headings = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);
    expect(headings.filter((heading) => heading === en['overview.tools'])).toHaveLength(1);
    expect(headings.indexOf(en['overview.tools'])).toBeGreaterThan(headings.indexOf(en['overview.card.kit.title']));
    expect(chainOf(bridge, kit)).toEqual(openChain(CATALOGUE_SCREEN_EXTENSION));
    expect(screen.getByRole('link', { name: en['overview.panel.agent.task'] }).getAttribute('href')).toBe('/first-change');
    const docs = screen.getByRole('link', { name: new RegExp(en['overview.panel.agent.kit']) });
    expect(docs.getAttribute('href')).toBe(versions.vars.aiKitUrl);
    expect(versions.vars.aiKitUrl).toContain('https://github.com/constructorfabric/gears-frontx/blob/');
    expect(versions.vars.aiKitUrl).toMatch(/\/blob\/[0-9a-f]{40}\/packages\/cyber-pilot-kit-frontx\/README\.md$/);
  });

  it("opens another screen through the screen domain on a click or on Enter, the link carrying no address, and ignores other keys, a held Enter, an input method's Enter and another button", async () => {
    const { bridge } = renderDocsAt('/');
    const link = await screen.findByRole('link', { name: en['overview.panel.templates.link'] });
    expect(chainOf(bridge, link)).toEqual(openChain(SITE_SCREEN_EXTENSIONS.templates));
    const execute = vi.spyOn(bridge, 'executeActionsChain');
    fireEvent.keyDown(link, { key: ' ' });
    fireEvent.keyDown(link, { key: 'Enter', repeat: true });
    fireEvent.keyDown(link, { key: 'Enter', isComposing: true });
    fireEvent.keyDown(link, { key: 'Enter', keyCode: 229 });
    fireEvent.click(link, { button: 1 });
    expect(execute).not.toHaveBeenCalled();
  });
});
