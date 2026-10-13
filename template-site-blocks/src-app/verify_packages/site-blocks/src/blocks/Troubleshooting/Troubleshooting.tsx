import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@gears-frontx/ui-kit';
import { Heading, Text } from '@gears-frontx/kit-candidates';

import styles from './Troubleshooting.module.css';

export interface TroubleshootingItem {
  /** The symptom the reader sees. */
  summary: string;
  /** What to check or do about it. */
  text: string;
}

export interface TroubleshootingProps {
  /** The heading's id, the target of an "On this page" jump. */
  id: string;
  title: string;
  items: readonly TroubleshootingItem[];
}

/*
 * What to check when a guide's result looks different: a titled list of symptoms, each opening its answer. The kit's Accordion holds the rows and the behaviour; any number of answers stay open at once.
 */
// @cpt-dod:cpt-template-site-blocks-dod-docs-blocks-troubleshooting:p1
// @cpt-algo:cpt-template-site-blocks-algo-docs-blocks-troubleshooting:p1
export function Troubleshooting({ id, title, items }: TroubleshootingProps) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-troubleshooting:p1:inst-heading */}
      <Heading id={id} size="display" tabIndex={-1} className={styles.title}>
        {title}
      </Heading>
      {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-troubleshooting:p1:inst-heading */}
      {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-troubleshooting:p1:inst-items */}
      <Accordion multiple>
        {items.map((item) => (
          <AccordionItem key={item.summary} value={item.summary}>
            <AccordionTrigger>{item.summary}</AccordionTrigger>
            <AccordionContent>
              <Text tone="muted">{item.text}</Text>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-troubleshooting:p1:inst-items */}
    </section>
  );
}
