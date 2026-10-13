import { createElement, type ReactNode } from 'react';
import { Check, FileCode } from 'lucide-react';
import { Badge, Card, CardContent, CardHeader, Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle, Separator } from '@gears-frontx/ui-kit';
import { CardTitle, CodeBlock, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle, Heading, Text, VisuallyHidden } from '@gears-frontx/kit-candidates';

import styles from './GuideStep.module.css';

/** A command or file excerpt the step shows, with the title over it. */
export interface GuideStepCode {
  title: string;
  code: string;
}

/** A file the step works with: its name (a link when the file has an address), what it is for and its path. */
export interface GuideStepFile {
  path: string;
  name: ReactNode;
  text: string;
}

/** A note under a step: a plain sentence, or a titled box of sentences for what the reader does next. */
export type GuideStepNote = string | { title: string; items: readonly string[] };

export interface GuideStepProps {
  /** The heading's id, the target of an "On this page" jump. */
  id: string;
  /** The step's position in its guide, shown in the marker beside the title. */
  number: number;
  title: string;
  lead?: string;
  code?: GuideStepCode;
  files?: readonly GuideStepFile[];
  /** The drawing of what the reader should see; a brand art component. */
  result?: ReactNode;
  /** What the reader should see when the step worked, with the hidden label that names it for assistive technology. */
  expected?: { label: string; text: string };
  note?: GuideStepNote;
  /** Links after the step's text, in one row. */
  links?: ReactNode;
  /** The copy button's labels for the code. */
  copyLabel: string;
  copiedLabel: string;
}

/*
 * One numbered step of a guide: ruled off above, the number marker apart from the title, then the lead, the command with Copy, the files, the result drawing, what to expect, a note and links. The marker is decoration: the heading's name is the title alone.
 */
// @cpt-dod:cpt-template-site-blocks-dod-docs-blocks-guide-step:p1
// @cpt-algo:cpt-template-site-blocks-algo-docs-blocks-guide-step:p1
export function GuideStep({ id, number, title, lead, code, files, result, expected, note, links, copyLabel, copiedLabel }: GuideStepProps) {
  return (
    <section className={styles.step} aria-labelledby={id}>
      <Separator />
      <div className={styles.body}>
        {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-guide-step:p1:inst-heading */}
        <div className={styles.heading}>
          <Badge variant="accent" aria-hidden="true" className={styles.number}>
            {number}
          </Badge>
          <Heading id={id} size="heading-1" tabIndex={-1} className={styles.title}>
            {title}
          </Heading>
        </div>
        {lead ? <Text tone="muted">{lead}</Text> : null}
        {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-guide-step:p1:inst-heading */}
        {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-guide-step:p1:inst-code */}
        {code ? (
          <CodeBlock code={code.code} label={code.title} wrap>
            <CodeBlockHeader>
              <CodeBlockTitle>{code.title}</CodeBlockTitle>
              <CodeBlockCopyButton copyLabel={copyLabel} copiedLabel={copiedLabel} />
            </CodeBlockHeader>
          </CodeBlock>
        ) : null}
        {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-guide-step:p1:inst-code */}
        {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-guide-step:p1:inst-files */}
        {files ? (
          <ItemGroup>
            {files.map((file) => (
              <Item key={file.path} variant="outline" role="listitem">
                <ItemMedia variant="icon">
                  <FileCode aria-hidden="true" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{file.name}</ItemTitle>
                  <ItemDescription>{file.text}</ItemDescription>
                  <Text variant="mono" tone="muted" render={createElement('code')}>
                    {file.path}
                  </Text>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        ) : null}
        {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-guide-step:p1:inst-files */}
        {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-guide-step:p1:inst-result */}
        {result}
        {expected ? (
          <Text variant="meta" tone="muted" className={styles.expected}>
            <Check aria-hidden="true" className={styles.icon} />
            <span>
              <VisuallyHidden>{expected.label} </VisuallyHidden>
              {expected.text}
            </span>
          </Text>
        ) : null}
        {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-guide-step:p1:inst-result */}
        {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-guide-step:p1:inst-note */}
        {note === undefined ? null : typeof note === 'string' ? (
          <Text tone="muted">{note}</Text>
        ) : (
          <Card size="sm">
            <CardHeader>
              <CardTitle render={createElement('h3')}>{note.title}</CardTitle>
            </CardHeader>
            <CardContent className={styles.noteItems}>
              {note.items.map((item) => (
                <Text key={item} tone="muted">
                  {item}
                </Text>
              ))}
            </CardContent>
          </Card>
        )}
        {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-guide-step:p1:inst-note */}
        {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-guide-step:p1:inst-links */}
        {links ? <div className={styles.links}>{links}</div> : null}
        {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-guide-step:p1:inst-links */}
      </div>
    </section>
  );
}
