import type { ReactNode } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@gears-frontx/ui-kit';
import { InspectorStack } from '@inbox-shared/blocks/InspectorPanel';

export type DetailsSectionProps = {
  /** The section's title, also its value in the details accordion. */
  title: string;
  children: ReactNode;
};

/**
 * One collapsible section of the customer details panel: an item of the
 * panel's kit `Accordion`, which holds which sections are open (every one
 * but Links, at first).
 */
export function DetailsSection({ title, children }: DetailsSectionProps) {
  return (
    <AccordionItem value={title}>
      <AccordionTrigger>{title}</AccordionTrigger>
      <AccordionContent>
        <InspectorStack>{children}</InspectorStack>
      </AccordionContent>
    </AccordionItem>
  );
}
