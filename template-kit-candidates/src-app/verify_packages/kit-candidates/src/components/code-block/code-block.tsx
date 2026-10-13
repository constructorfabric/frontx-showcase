'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { Button, type ButtonProps } from '@gears-frontx/ui-kit';
import { cva, cx, type VariantProps } from 'class-variance-authority';
import { Check, Copy } from 'lucide-react';
import { createContext, useContext, useEffect, useRef, useState, type ComponentProps } from 'react';

import { VisuallyHidden } from '../visually-hidden/visually-hidden.js';
import styles from './code-block.module.css';

/*
 * A block of code the application places on a screen: a frame with an
 * optional header (title, copy button) over `pre > code`. Names follow the
 * shadcn AI Elements code block family. No syntax highlighting: it would add
 * a highlighter to every consumer; `language` is carried as data for a
 * consumer that highlights on its own.
 */

interface CodeBlockContextValue {
  code: string;
}

const CodeBlockContext = createContext<CodeBlockContextValue | null>(null);

// @cpt-dod:cpt-template-kit-candidates-dod-code-and-description-code-block:p1
// @cpt-algo:cpt-template-kit-candidates-algo-code-and-description-code-frame:p1
// @cpt-begin:cpt-template-kit-candidates-algo-code-and-description-code-frame:p1:inst-size-class
const codeBlockVariants = cva(styles.codeBlock, {
  variants: {
    size: {
      default: styles.sizeDefault,
      sm: styles.sizeSm,
    },
  },
  defaultVariants: {
    size: 'default',
  },
});
// @cpt-end:cpt-template-kit-candidates-algo-code-and-description-code-frame:p1:inst-size-class

export interface CodeBlockProps extends ComponentProps<'div'>, VariantProps<typeof codeBlockVariants> {
  /** The code, shown verbatim and written to the clipboard by the copy button. */
  code: string;
  /** The code's language, reflected as `data-language` for a consumer that highlights. */
  language?: string;
  /** The accessible name of the scroll region. */
  label: string;
  /**
   * Soft-wrap long lines instead of scrolling them. A wrapped block has
   * nothing to scroll, so it is not a focusable region.
   * @default false
   */
  wrap?: boolean;
}

export function CodeBlock({ code, language, label, wrap = false, size, className, children, ...props }: CodeBlockProps) {
  // @cpt-begin:cpt-template-kit-candidates-algo-code-and-description-code-frame:p1:inst-provide-code
  return (
    <CodeBlockContext.Provider value={{ code }}>
      <div className={codeBlockVariants({ size: size ?? 'default', className })} data-language={language} {...props}>
        {children}
        {/* @cpt-begin:cpt-template-kit-candidates-algo-code-and-description-code-frame:p1:inst-scroll-region */}
        <pre
          className={cx(styles.pre, wrap && styles.wrap)}
          tabIndex={wrap ? undefined : 0}
          role={wrap ? undefined : 'region'}
          aria-label={wrap ? undefined : label}
        >
          <code className={styles.code}>{code}</code>
        </pre>
        {/* @cpt-end:cpt-template-kit-candidates-algo-code-and-description-code-frame:p1:inst-scroll-region */}
      </div>
    </CodeBlockContext.Provider>
  );
  // @cpt-end:cpt-template-kit-candidates-algo-code-and-description-code-frame:p1:inst-provide-code
}

export type CodeBlockHeaderProps = ComponentProps<'div'>;

export function CodeBlockHeader({ className, ...props }: CodeBlockHeaderProps) {
  // @cpt-begin:cpt-template-kit-candidates-algo-code-and-description-code-frame:p1:inst-header
  return <div className={cx(styles.codeBlockHeader, className)} {...props} />;
  // @cpt-end:cpt-template-kit-candidates-algo-code-and-description-code-frame:p1:inst-header
}

export type CodeBlockTitleProps = useRender.ComponentProps<'div'>;

export function CodeBlockTitle({ className, render, ...props }: CodeBlockTitleProps) {
  // @cpt-begin:cpt-template-kit-candidates-algo-code-and-description-code-frame:p1:inst-header
  return useRender({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>({ className: cx(styles.codeBlockTitle, className) }, props),
  });
  // @cpt-end:cpt-template-kit-candidates-algo-code-and-description-code-frame:p1:inst-header
}

export interface CodeBlockCopyButtonProps extends Omit<ButtonProps, 'onCopy' | 'onError'> {
  /** @default 'Copy' */
  copyLabel?: string;
  /** @default 'Copied' */
  copiedLabel?: string;
  /** How long the button shows `copiedLabel`, in milliseconds. @default 2000 */
  timeout?: number;
  /** Called after the code is on the clipboard. */
  onCopy?: () => void;
  /** Called when the clipboard is missing or refuses the write. */
  onError?: (error: unknown) => void;
}

// @cpt-flow:cpt-template-kit-candidates-flow-code-and-description-copy-code:p1
// @cpt-state:cpt-template-kit-candidates-state-code-and-description-copy-label:p2
export function CodeBlockCopyButton({
  copyLabel = 'Copy',
  copiedLabel = 'Copied',
  timeout = 2000,
  onCopy,
  onError,
  onClick,
  variant = 'ghost',
  size = 'sm',
  className,
  ...props
}: CodeBlockCopyButtonProps) {
  // @cpt-begin:cpt-template-kit-candidates-flow-code-and-description-copy-code:p1:inst-read-code
  const context = useContext(CodeBlockContext);
  if (!context) throw new Error('CodeBlockCopyButton must be rendered inside a CodeBlock');
  // @cpt-end:cpt-template-kit-candidates-flow-code-and-description-copy-code:p1:inst-read-code
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    // @cpt-begin:cpt-template-kit-candidates-flow-code-and-description-copy-code:p1:inst-write
    try {
      if (!navigator.clipboard?.writeText) throw new Error('The clipboard is not available');
      await navigator.clipboard.writeText(context.code);
    } catch (error) {
      onError?.(error);
      return;
    }
    // @cpt-end:cpt-template-kit-candidates-flow-code-and-description-copy-code:p1:inst-write
    // @cpt-begin:cpt-template-kit-candidates-flow-code-and-description-copy-code:p1:inst-confirm
    // @cpt-begin:cpt-template-kit-candidates-state-code-and-description-copy-label:p2:inst-to-copied
    setCopied(true);
    // @cpt-end:cpt-template-kit-candidates-state-code-and-description-copy-label:p2:inst-to-copied
    onCopy?.();
    // @cpt-begin:cpt-template-kit-candidates-state-code-and-description-copy-label:p2:inst-copy-again
    clearTimeout(timer.current);
    // @cpt-end:cpt-template-kit-candidates-state-code-and-description-copy-label:p2:inst-copy-again
    // @cpt-begin:cpt-template-kit-candidates-state-code-and-description-copy-label:p2:inst-to-idle
    timer.current = setTimeout(() => setCopied(false), timeout);
    // @cpt-end:cpt-template-kit-candidates-state-code-and-description-copy-label:p2:inst-to-idle
    // @cpt-end:cpt-template-kit-candidates-flow-code-and-description-copy-code:p1:inst-confirm
  };

  const Icon = copied ? Check : Copy;
  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cx(styles.copyButton, className)}
        icon={<Icon aria-hidden="true" />}
        onClick={(event) => {
          onClick?.(event);
          void copy();
        }}
        {...props}
      >
        {copied ? copiedLabel : copyLabel}
      </Button>
      {/* @cpt-begin:cpt-template-kit-candidates-flow-code-and-description-copy-code:p1:inst-announce */}
      <VisuallyHidden role="status">{copied ? copiedLabel : ''}</VisuallyHidden>
      {/* @cpt-end:cpt-template-kit-candidates-flow-code-and-description-copy-code:p1:inst-announce */}
    </>
  );
}
