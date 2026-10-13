import { createElement, type ReactNode } from 'react';
import { CardContent, CardDescription, CardFooter, CardHeader } from '@gears-frontx/ui-kit';
import { Card, CardTitle, CodeBlock, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle, Text } from '@gears-frontx/kit-candidates';
import styles from './PackageList.module.css';

export interface PackageEntry {
  /** The card's figure, drawn by brand art; decoration only. */
  figure?: ReactNode;
  /** The full package name, shown above the title. */
  name: string;
  title: string;
  text: string;
  /** The install command, its header title and the accessible name of its scroll region. */
  install?: { command: string; title: string; label: string };
  /** The package's links, in a row under the text. */
  actions?: ReactNode;
}

export interface PackageListProps {
  packages: readonly PackageEntry[];
  /** The copy button's label and its confirmation. */
  copyLabel: string;
  copiedLabel: string;
}

// @cpt-dod:cpt-template-site-blocks-dod-docs-blocks-package-list:p1
// @cpt-algo:cpt-template-site-blocks-algo-docs-blocks-package-list:p1
/** The packages a reader installs one by one: cards two to a row, each a figure beside the package name and title, a sentence, the install command with a copy button and the package's links. */
export function PackageList({ packages, copyLabel, copiedLabel }: PackageListProps) {
  return (
    <ul className={styles.grid}>
      {packages.map((entry) => (
        <li key={entry.name} className={styles.cell}>
          <Card className={styles.card}>
            {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-package-list:p1:inst-heading */}
            <CardHeader className={styles.heading}>
              {entry.figure ? (
                <span className={styles.figure} aria-hidden="true">
                  {entry.figure}
                </span>
              ) : null}
              <span className={styles.names}>
                <Text variant="label" tone="muted" render={createElement('code')}>
                  {entry.name}
                </Text>
                <CardTitle render={createElement('h2')}>{entry.title}</CardTitle>
              </span>
            </CardHeader>
            {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-package-list:p1:inst-heading */}
            <CardContent className={styles.body}>
              <CardDescription>{entry.text}</CardDescription>
              {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-package-list:p1:inst-install */}
              {entry.install ? (
                <CodeBlock code={entry.install.command} label={entry.install.label} language="sh">
                  <CodeBlockHeader>
                    <CodeBlockTitle>{entry.install.title}</CodeBlockTitle>
                    <CodeBlockCopyButton copyLabel={copyLabel} copiedLabel={copiedLabel} />
                  </CodeBlockHeader>
                </CodeBlock>
              ) : null}
              {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-package-list:p1:inst-install */}
            </CardContent>
            {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-package-list:p1:inst-actions */}
            {entry.actions ? <CardFooter className={styles.actions}>{entry.actions}</CardFooter> : null}
            {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-package-list:p1:inst-actions */}
          </Card>
        </li>
      ))}
    </ul>
  );
}
