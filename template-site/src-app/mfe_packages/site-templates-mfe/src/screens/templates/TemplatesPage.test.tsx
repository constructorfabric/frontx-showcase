import { fireEvent, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { keyFileContent, parseOutline } from '@site-shared/content/outline';
import outlineJson from '../../content/outline.generated.json';
import en from './i18n/en.json';
import { SHOW_GUIDE_ACTION, SITE_SCREEN_EXTENSIONS } from '@site-shared/navigation/siteScreens';
import { chainOf, openChain } from '@site-shared/test-support/screenLinks';
import { renderTemplatesAt } from '../../test-support/renderAt';

const outline = parseOutline(outlineJson);
const shellEntry = outline.pages.find((page) => page.route === '/template-shell')?.entries.find((entry) => entry.type === 'file-explorer');
if (shellEntry?.type !== 'file-explorer') throw new Error('the outline has no file-explorer entry for template-shell');
const shellExplorer = shellEntry;
const shellFiles = shellExplorer.files;

/** The demo screens template-mfe-demo's manifest declares, which the template-mfe page's example opens. */
const HELLO_WORLD = 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.demo.screens.helloworld.v1';
const WIDGETS = 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.widgets.host.screen.v1';

vi.mock('@gears-frontx/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@gears-frontx/react')>();
  return {
    ...actual,
    apiRegistry: { getService: () => ({ getCatalogue: {} }) },
    useApiQuery: () => ({ data: outline, isLoading: false, isError: false }),
  };
});

beforeEach(() => {
  vi.stubGlobal('scrollTo', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState(null, '', '/');
});

describe('TemplatesPage', () => {
  it('leads the index with the shell and the MFE workspace, adds Design Guardrails, then points to the guide that runs them, with no site template and no "On this page" panel', async () => {
    const { bridge } = renderTemplatesAt('/');
    expect(await screen.findByRole('heading', { level: 1, name: en['index.title'] })).toBeTruthy();
    const start = screen.getByRole('heading', { level: 2, name: en['groups.start.title'] });
    expect(start.closest('header')?.textContent).toContain(en['groups.start.label']);
    const links = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(links.slice(0, 3)).toEqual(['/template-shell', '/template-mfe', '/template-design-guardrails']);
    expect(links).not.toContain('/template-site');
    expect(screen.getByRole('link', { name: new RegExp(en['templates.template-design-guardrails.indexName']) })).toBeTruthy();
    const cta = screen.getByTestId('band-action');
    expect(chainOf(bridge, cta)).toEqual(openChain(SITE_SCREEN_EXTENSIONS.docs, { type: SHOW_GUIDE_ACTION, payload: { guide: 'get-started' } }));
    expect(screen.queryByRole('navigation', { name: en['chrome.onThisPage'] })).toBeNull();
  });

  /** The viewer of the chosen file: the region its code scrolls in, named by the file's path, and the card around it. */
  const viewerOf = async (path: string) => (await screen.findByRole('region', { name: path })).closest('[class]')?.parentElement?.parentElement as HTMLElement;
  const fileButtons = () => within(screen.getByRole('navigation', { name: en['chrome.keyFiles'] })).getAllByRole('button');

  it("puts a template's file explorer first, then what it gives as a list of items and its source buttons beside the facts", async () => {
    renderTemplatesAt('/template-shell');
    const code = await screen.findByRole('region', { name: shellFiles[0].path });
    const gives = screen.getByText(en['templates.template-shell.gives.1']);
    const facts = screen.getByRole('heading', { level: 2, name: en['before.title'] });
    expect(code.compareDocumentPosition(gives) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(gives.compareDocumentPosition(facts) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('link', { name: new RegExp(en['actions.manifest']) }).getAttribute('href')).toMatch(/\/blob\/[0-9a-f]{40}\/template-shell\/frontx-template\.json$/);
    expect(screen.getByRole('link', { name: new RegExp(en['legal.license']) }).getAttribute('href')).toMatch(/\/blob\/[0-9a-f]{40}\/LICENSE$/);
  });

  it("renders a template's page with its manifest description, facts, key files and the twin link", async () => {
    renderTemplatesAt('/template-mfe');
    expect(await screen.findByRole('heading', { level: 1, name: en['templates.template-mfe.name'] })).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 2, name: en['before.title'] })).toBeTruthy();
    expect(fileButtons().map((row) => row.textContent)).toContain('mfe.jsonsrc-app/mfe_packages/_blank-mfe');
    expect(screen.getByTestId('page-twin').getAttribute('href')).toBe('./templates/template-mfe.md');
  });

  it('shows the key files with their content, the pinned source commit and a GitHub link to the file at that commit', async () => {
    renderTemplatesAt('/template-shell');
    const first = shellFiles[0];
    const viewer = await viewerOf(first.path);
    expect(within(viewer).getByRole('heading', { level: 3, name: (en as Record<string, string>)[first.text.slice(2)] })).toBeTruthy();
    expect(within(viewer).getByRole('region', { name: first.path }).textContent).toBe(keyFileContent(first));
    expect(within(viewer).getByText(`${first.lines} ${en['chrome.lines']} · ${en['explorer.unmodified']}`)).toBeTruthy();
    expect(within(viewer).getByRole('link', { name: new RegExp(en['chrome.github']) }).getAttribute('href')).toBe(first.url);
    expect(screen.getAllByText(new RegExp(`^${en['source.label']}`)).map((line) => line.textContent)).toContain(`${en['source.label']} ${shellExplorer.source?.value}`);
    expect(screen.getByRole('link', { name: new RegExp(en['explorer.repository']) }).getAttribute('href')).toMatch(/\/tree\/[0-9a-f]{40}\/template-shell$/);
  });

  it('copies the text of the chosen file, finds files by path and shows a file the list is switched to', async () => {
    const writeText = vi.fn(async () => undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    renderTemplatesAt('/template-shell');
    await screen.findByRole('region', { name: shellFiles[0].path });
    const find = screen.getByRole('textbox', { name: en['chrome.findFile'] });
    fireEvent.change(find, { target: { value: 'dev-all' } });
    const rows = fileButtons();
    expect(rows).toHaveLength(1);
    fireEvent.click(rows[0]);
    const chosen = shellFiles.find((file) => file.path.includes('dev-all'));
    if (!chosen) throw new Error('template-shell has no dev-all key file');
    const viewer = await viewerOf(chosen.path);
    fireEvent.click(within(viewer).getByRole('button', { name: en['chrome.copy'] }));
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith(keyFileContent(chosen)));
    fireEvent.change(find, { target: { value: 'no-such-file' } });
    expect(screen.getByText(en['chrome.noFiles'])).toBeTruthy();
  });

  it('opens the example tab with the screens of this site as links that open them through the screen domain', async () => {
    const { bridge } = renderTemplatesAt('/template-mfe');
    fireEvent.click(await screen.findByRole('tab', { name: en['chrome.example'] }));
    expect(await screen.findByRole('link', { name: en['screens.mfe-hello-world'] })).toBeTruthy();
    expect(chainOf(bridge, screen.getByRole('link', { name: en['screens.mfe-widgets'] }))).toEqual(openChain(WIDGETS));
    expect(chainOf(bridge, screen.getByTestId('explorer-open-example'))).toEqual(openChain(HELLO_WORLD));
    expect(screen.getByText(en['templates.template-mfe.exampleLead'])).toBeTruthy();
  });

  it('has no example tab for a template without a live screen', async () => {
    renderTemplatesAt('/template-design-guardrails');
    await screen.findByRole('tab', { name: en['chrome.files'] });
    expect(screen.queryByRole('tab', { name: en['chrome.example'] })).toBeNull();
  });

  it("names this repository as the source of the site's own templates, with no file link", async () => {
    renderTemplatesAt('/template-site');
    await screen.findByRole('tab', { name: en['chrome.files'] });
    expect(screen.getAllByText(new RegExp(`^${en['source.label']}`)).map((line) => line.textContent)).toContain(`${en['source.label']} ${en['source.thisRepositoryShort']}`);
    expect(screen.queryByRole('link', { name: new RegExp(en['chrome.github']) })).toBeNull();
    expect(screen.queryByRole('link', { name: new RegExp(en['actions.manifest']) })).toBeNull();
  });

  it('states the manifest-true requirement of template-mfe-demo', async () => {
    renderTemplatesAt('/template-mfe-demo');
    expect(await screen.findByText(en['requires.shell-and-kit-candidates-without-mfe'])).toBeTruthy();
  });

  it("renders the screen's not-found page for an unknown template", async () => {
    renderTemplatesAt('/template-nowhere');
    expect(await screen.findByRole('heading', { level: 1, name: en.not_found_title })).toBeTruthy();
  });
});
