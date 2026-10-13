import { createElement, useId, type ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@gears-frontx/ui-kit';
import { VisuallyHidden } from '@gears-frontx/kit-candidates';
import styles from './InspectorPanel.module.css';

export type InspectorPanelTab = {
  value: string;
  label: string;
  content: ReactNode;
};

export type InspectorPanelProps = {
  /** The landmark's name, also its section heading for assistive technology. */
  label: string;
  /** The panel's tabs; the first one is open first. */
  tabs: InspectorPanelTab[];
};

/**
 * A 19rem panel beside a thread with tabs over scrolling bodies: the chat's
 * customer details and assistant. Under the chat-details width it gives its
 * column back to the thread. Its name is a second-level heading read by
 * assistive technology only, so the third-level headings of a kit Accordion
 * inside it follow the screen's one first-level heading in order.
 */
// @cpt-dod:cpt-template-inbox-dod-screen-frame-blocks:p2
export function InspectorPanel({ label, tabs }: InspectorPanelProps) {
  const headingId = useId();
  return (
    <aside className={styles.panel} aria-labelledby={headingId}>
      <VisuallyHidden render={createElement('h2', { id: headingId })}>{label}</VisuallyHidden>
      <Tabs defaultValue={tabs[0]?.value}>
        <TabsList variant="line">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <div className={styles.body}>{tab.content}</div>
          </TabsContent>
        ))}
      </Tabs>
    </aside>
  );
}

/** A stack inside the panel's body: a few controls, or a title over its line. */
export function InspectorStack({ children }: { children: ReactNode }) {
  return <div className={styles.stack}>{children}</div>;
}
