import { createElement, useState, type ReactNode } from 'react';
import { CodeXml, FileCode, FolderOpen, Play, Search } from 'lucide-react';
import { Button, Input, Separator, Tabs, TabsContent, TabsList, TabsTrigger } from '@gears-frontx/ui-kit';
import { Card, CodeBlock, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle, Heading, Link, Text, VisuallyHidden } from '@gears-frontx/kit-candidates';

import styles from './FileExplorer.module.css';

/** One file of the explorer. */
export interface ExplorerFile {
  /** The path inside the template; the list shows its last segment as the name and the rest as the folder. */
  path: string;
  /** What the file is for: the viewer's heading. */
  description: string;
  /** Address of the file at the pinned commit. */
  url?: string;
  /** The line count the viewer's footer shows. */
  lines: number;
  content: string;
}

/** Strings the explorer shows; the caller translates them. */
export interface FileExplorerLabels {
  copy: string;
  copied: string;
  lines: string;
  files: string;
  example: string;
  keyFiles: string;
  findFile: string;
  noFiles: string;
  github: string;
  templateRoot: string;
}

export interface FileExplorerProps {
  /** Id of the explorer's hidden heading, the target of an "On this page" jump. */
  id: string;
  title: string;
  files: readonly ExplorerFile[];
  labels: FileExplorerLabels;
  /** The line beside the tabs that names where the files come from, such as the source commit. */
  source?: { label: string; value: string };
  /** Content of the Example tab; the tab exists only when it is given. */
  example?: ReactNode;
  /** The line under the file list: what the list is and a link to the whole source. */
  scope?: ReactNode;
  /** What the viewer's footer says about every file after its line count, such as that it is unmodified. */
  note?: string;
  /** Links at the end of the viewer's footer, such as the license and the notice. */
  legal?: ReactNode;
}

// @cpt-dod:cpt-template-site-blocks-dod-docs-blocks-file-explorer:p1
// @cpt-flow:cpt-template-site-blocks-flow-docs-blocks-browse-files:p1
/** The file's name and the folder it sits in, as the file list shows them. */
export function splitPath(path: string): { name: string; folder: string | undefined } {
  // @cpt-begin:cpt-template-site-blocks-flow-docs-blocks-browse-files:p1:inst-list-rows
  const cut = path.lastIndexOf('/');
  return cut === -1 ? { name: path, folder: undefined } : { name: path.slice(cut + 1), folder: path.slice(0, cut) };
  // @cpt-end:cpt-template-site-blocks-flow-docs-blocks-browse-files:p1:inst-list-rows
}

/** The files whose path contains the query, ignoring case and outer spaces; an empty query keeps them all. */
export function filterFiles<F extends { path: string }>(files: readonly F[], query: string): F[] {
  // @cpt-begin:cpt-template-site-blocks-flow-docs-blocks-browse-files:p1:inst-filter-files
  const needle = query.trim().toLowerCase();
  return needle === '' ? [...files] : files.filter((file) => file.path.toLowerCase().includes(needle));
  // @cpt-end:cpt-template-site-blocks-flow-docs-blocks-browse-files:p1:inst-filter-files
}

/*
 * A template's key files: the kit's Tabs (Files, and Example when given) beside the source line, then one kit Card split into the file rail (heading with the count, the find box, the files as kit Buttons in a navigation landmark, the scope line) and the viewer of the chosen file (its description as the heading, its path, its code with Copy, its line count and the legal links).
 */
export function FileExplorer({ id, title, files, labels, source, example, scope, note, legal }: FileExplorerProps) {
  // @cpt-begin:cpt-template-site-blocks-flow-docs-blocks-browse-files:p1:inst-hold-state
  const [tab, setTab] = useState('files');
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState(files[0]?.path);
  // @cpt-end:cpt-template-site-blocks-flow-docs-blocks-browse-files:p1:inst-hold-state
  // @cpt-begin:cpt-template-site-blocks-flow-docs-blocks-browse-files:p1:inst-filter-files
  const visible = filterFiles(files, query);
  // @cpt-end:cpt-template-site-blocks-flow-docs-blocks-browse-files:p1:inst-filter-files
  // @cpt-begin:cpt-template-site-blocks-flow-docs-blocks-browse-files:p1:inst-pick-file
  const file = files.find((entry) => entry.path === chosen) ?? files[0];
  // @cpt-end:cpt-template-site-blocks-flow-docs-blocks-browse-files:p1:inst-pick-file

  // @cpt-begin:cpt-template-site-blocks-flow-docs-blocks-browse-files:p1:inst-render-explorer
  return (
    <section className={styles.explorer} aria-labelledby={id}>
      <VisuallyHidden render={createElement('h2')} id={id} tabIndex={-1}>
        {title}
      </VisuallyHidden>
      <Tabs value={tab} onValueChange={(value) => typeof value === 'string' && setTab(value)}>
        <div className={styles.bar}>
          <TabsList variant="line" size="sm">
            <TabsTrigger value="files" className={styles.tab}>
              <CodeXml aria-hidden="true" />
              {labels.files}
            </TabsTrigger>
            {example ? (
              <TabsTrigger value="example" className={styles.tab}>
                <Play aria-hidden="true" />
                {labels.example}
              </TabsTrigger>
            ) : null}
          </TabsList>
          {source ? (
            <Text variant="meta" tone="muted">
              {source.label}{' '}
              <Text variant="mono" render={createElement('code')}>
                {source.value}
              </Text>
            </Text>
          ) : null}
        </div>

        <TabsContent value="files">
          <Card className={styles.frame}>
            <div className={styles.rail}>
              <Text variant="label" className={styles.railHeading}>
                <FolderOpen aria-hidden="true" className={styles.icon} />
                <span>{labels.keyFiles}</span>
                <Text variant="meta" tone="muted" render={createElement('span')}>
                  {files.length}
                </Text>
              </Text>
              <Input icon={<Search aria-hidden="true" />} placeholder={labels.findFile} aria-label={labels.findFile} value={query} onChange={(event) => setQuery(event.target.value)} />
              {visible.length === 0 ? (
                <Text tone="muted">{labels.noFiles}</Text>
              ) : (
                <nav aria-label={labels.keyFiles} className={styles.files}>
                  {visible.map((entry) => {
                    // @cpt-begin:cpt-template-site-blocks-flow-docs-blocks-browse-files:p1:inst-list-rows
                    const { name, folder } = splitPath(entry.path);
                    const current = entry.path === file?.path;
                    return (
                      <Button key={entry.path} variant={current ? 'secondary' : 'ghost'} aria-pressed={current} onClick={() => setChosen(entry.path)} icon={<FileCode aria-hidden="true" />} className={styles.file}>
                        <span className={styles.fileText}>
                          <span>{name}</span>
                          <Text variant="meta" tone="muted" render={createElement('span')}>
                            {folder ?? labels.templateRoot}
                          </Text>
                        </span>
                      </Button>
                    );
                    // @cpt-end:cpt-template-site-blocks-flow-docs-blocks-browse-files:p1:inst-list-rows
                  })}
                </nav>
              )}
              {scope ? (
                <Text variant="meta" tone="muted" render={createElement('div')} className={styles.scope}>
                  {scope}
                </Text>
              ) : null}
            </div>
            <Separator orientation="vertical" className={styles.ruleWide} />
            <Separator className={styles.ruleNarrow} />
            {file ? (
              <div className={styles.viewer}>
                <div className={styles.viewerHeader}>
                  <div className={styles.viewerTitle}>
                    <Heading size="heading-2" render={createElement('h3')}>
                      {file.description}
                    </Heading>
                    <Text variant="mono" tone="muted" render={createElement('code')}>
                      {file.path}
                    </Text>
                  </div>
                  {file.url ? (
                    <Link href={file.url} external>
                      {labels.github}
                    </Link>
                  ) : null}
                </div>
                <CodeBlock code={file.content} label={file.path} className={styles.code}>
                  <CodeBlockHeader>
                    <CodeBlockTitle>{file.path}</CodeBlockTitle>
                    <CodeBlockCopyButton copyLabel={labels.copy} copiedLabel={labels.copied} />
                  </CodeBlockHeader>
                </CodeBlock>
                <Text variant="meta" tone="muted" render={createElement('div')} className={styles.footer}>
                  <span>
                    {file.lines} {labels.lines}
                    {note ? ` · ${note}` : null}
                  </span>
                  {legal ? <span className={styles.legal}>{legal}</span> : null}
                </Text>
              </div>
            ) : null}
          </Card>
        </TabsContent>

        {example ? <TabsContent value="example">{example}</TabsContent> : null}
      </Tabs>
    </section>
  );
  // @cpt-end:cpt-template-site-blocks-flow-docs-blocks-browse-files:p1:inst-render-explorer
}
