import type { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@gears-frontx/ui-kit';
import { Text } from '@gears-frontx/kit-candidates';
import { cx } from '../../ui/cx';
import styles from './ReplyComposer.module.css';

export type ReplyComposerProps = {
  /** A notice above the box: the kit `Alert` saying the last post failed. */
  notice?: ReactNode;
  /** `ReplyComposerTabs` around a `ReplyComposerBox`, or the box alone. */
  children: ReactNode;
};

/** The reply area at the foot of a thread, ruled off from the transcript above it. */
// @cpt-dod:cpt-template-inbox-dod-screen-frame-blocks:p2
export function ReplyComposer({ notice, children }: ReplyComposerProps) {
  return (
    <div className={styles.composer}>
      {notice}
      {children}
    </div>
  );
}

export type ReplyComposerTabsProps = {
  value: string;
  onValueChange: (value: unknown) => void;
  tabs: { value: string; label: string }[];
  /** The box, the same one under every tab. */
  children: ReactNode;
};

/** Tabs over the box (reply, note); their line scrolls when the composer is narrower than the triggers. */
export function ReplyComposerTabs({ value, onValueChange, tabs, children }: ReplyComposerTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList variant="line" className={styles.tabs}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {/* Each tab owns a panel so the tablist has something to control; the kit unmounts the inactive one, so one box exists at a time. */}
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {children}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export type ReplyComposerBoxProps = {
  /** The kit `Textarea`. */
  field: ReactNode;
  /** Tool buttons at the start of the row under the field. */
  tools?: ReactNode;
  /** The send shortcut, said in muted meta text before the send button. */
  hint: ReactNode;
  /** The kit `Button` that sends. */
  send: ReactNode;
  /** An internal note rather than a reply: the frame says so in the warning colour. */
  note?: boolean;
};

/** The field and the row under it: tools at the start, the shortcut hint and the send button at the end. */
export function ReplyComposerBox({ field, tools, hint, send, note = false }: ReplyComposerBoxProps) {
  return (
    <div className={cx(styles.box, note && styles.boxNote)}>
      {field}
      <div className={styles.toolbar}>
        {tools === undefined ? null : <div className={styles.tools}>{tools}</div>}
        <span className={styles.spacer} />
        <Text variant="meta" tone="muted" render={<span />}>
          {hint}
        </Text>
        {send}
      </div>
    </div>
  );
}
