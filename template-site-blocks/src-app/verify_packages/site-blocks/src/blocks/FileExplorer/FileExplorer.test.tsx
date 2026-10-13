import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '../../test-support/axe';
import { FileExplorer, filterFiles, splitPath, type FileExplorerProps } from './FileExplorer';

const props: FileExplorerProps = {
  id: 'key-files',
  title: 'Key files',
  files: [
    { path: 'frontx-template.json', description: 'Template identity and ownership', url: 'https://example.org/frontx-template.json', lines: 3, content: '{\n  "name": "shell"\n}' },
    { path: 'src-app/app/main.tsx', description: 'Application entry', lines: 1, content: 'createRoot(root).render(<App />);' },
  ],
  labels: {
    copy: 'Copy',
    copied: 'Copied',
    lines: 'lines',
    files: 'Files',
    example: 'Example',
    keyFiles: 'Key files',
    findFile: 'Find a file',
    noFiles: 'No file matches.',
    github: 'GitHub',
    templateRoot: 'Template root',
  },
  source: { label: 'Source', value: '3b6cddb2' },
  note: 'Unmodified source',
};

describe('splitPath and filterFiles', () => {
  it('splits a path into the name and its folder, and a root file has no folder', () => {
    expect(splitPath('src-app/app/main.tsx')).toEqual({ name: 'main.tsx', folder: 'src-app/app' });
    expect(splitPath('vite.config.ts')).toEqual({ name: 'vite.config.ts', folder: undefined });
  });

  it('keeps the files whose path contains the query, ignoring case and outer spaces', () => {
    expect(filterFiles(props.files, ' MAIN ').map((file) => file.path)).toEqual(['src-app/app/main.tsx']);
    expect(filterFiles(props.files, '')).toHaveLength(2);
  });
});

describe('FileExplorer', () => {
  it('is a section named by its hidden heading, with the Files tab and the source line', () => {
    render(<FileExplorer {...props} />);
    const section = screen.getByRole('region', { name: 'Key files' });
    expect(within(section).getByRole('heading', { level: 2, name: 'Key files' }).id).toBe('key-files');
    expect(within(section).getByRole('tab', { name: 'Files' }).getAttribute('aria-selected')).toBe('true');
    expect(within(section).queryByRole('tab', { name: 'Example' })).toBeNull();
    expect(within(section).getByText('3b6cddb2')).toBeTruthy();
  });

  it('shows the first file: its description as the viewer heading, its path, its code with copy, its line count and note', () => {
    render(<FileExplorer {...props} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Template identity and ownership' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'frontx-template.json' }).textContent).toBe('{\n  "name": "shell"\n}');
    expect(screen.getByRole('button', { name: 'Copy' })).toBeTruthy();
    expect(screen.getByText('3 lines · Unmodified source')).toBeTruthy();
    expect(screen.getByRole('link', { name: /GitHub/ }).getAttribute('href')).toBe('https://example.org/frontx-template.json');
  });

  it('marks the chosen file and switches the viewer when another file is chosen', () => {
    render(<FileExplorer {...props} />);
    const nav = screen.getByRole('navigation', { name: 'Key files' });
    const [first, second] = within(nav).getAllByRole('button') as [HTMLElement, HTMLElement];
    expect(first.getAttribute('aria-pressed')).toBe('true');
    expect(first.textContent).toContain('Template root');
    expect(second.textContent).toContain('src-app/app');
    fireEvent.click(second);
    expect(second.getAttribute('aria-pressed')).toBe('true');
    expect(first.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('heading', { level: 3, name: 'Application entry' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /GitHub/ })).toBeNull();
  });

  it('filters the list from the find box and says so when nothing matches', () => {
    render(<FileExplorer {...props} />);
    const find = screen.getByRole('textbox', { name: 'Find a file' });
    fireEvent.change(find, { target: { value: 'main' } });
    expect(within(screen.getByRole('navigation', { name: 'Key files' })).getAllByRole('button')).toHaveLength(1);
    fireEvent.change(find, { target: { value: 'nothing-like-this' } });
    expect(screen.getByText('No file matches.')).toBeTruthy();
  });

  it('adds the Example tab only when an example is given, and shows it when chosen', () => {
    render(<FileExplorer {...props} example={<p>Live example</p>} />);
    const tab = screen.getByRole('tab', { name: 'Example' });
    fireEvent.click(tab);
    expect(tab.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('Live example')).toBeTruthy();
  });

  it('places the scope line and the legal links the caller passes', () => {
    render(<FileExplorer {...props} scope={<a href="#repo">Full repository</a>} legal={<a href="#license">Apache-2.0</a>} />);
    expect(screen.getByRole('link', { name: 'Full repository' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Apache-2.0' })).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const { container } = render(<FileExplorer {...props} example={<p>Live example</p>} scope={<a href="#repo">Full repository</a>} />);
    await expectNoAxeViolations(container);
  });
});
