import { CodeBlock, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle } from '@gears-frontx/kit-candidates';
import styles from './CodeSample.module.css';

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export interface CodeSampleProps {
  /** The caption: a file name or what the command does. */
  title: string;
  code: string;
  copyLabel: string;
  copiedLabel: string;
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

/** A titled block of source or commands with a copy button: the kit-candidate `CodeBlock`, held to 32rem high so a long file scrolls inside its frame. */
// @cpt-dod:cpt-template-catalogue-dod-catalogue-screen-blocks:p1
// @cpt-algo:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1
export function CodeSample({ title, code, copyLabel, copiedLabel }: CodeSampleProps) {
  // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-lay-out-slots
  return (
    <div className={styles.sample}>
      {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-lay-out-slots */}
      {/* @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
      <CodeBlock code={code} label={title}>
        <CodeBlockHeader>
          <CodeBlockTitle>{title}</CodeBlockTitle>
          <CodeBlockCopyButton copyLabel={copyLabel} copiedLabel={copiedLabel} />
        </CodeBlockHeader>
      </CodeBlock>
      {/* @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-text */}
    </div>
  );
}
