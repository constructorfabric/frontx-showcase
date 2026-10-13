import { createElement, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { CardContent, CardHeader, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@gears-frontx/ui-kit';
import { Card, CardTitle, CodeBlock, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle, Text } from '@gears-frontx/kit-candidates';

import styles from './AgentTask.module.css';

export interface AgentTaskProps {
  /** The card's id, the target of an "On this page" jump. */
  id: string;
  /** The line that opens the task. */
  summary: string;
  lead?: string;
  /** The task's text, handed to a coding agent as it is, with the title over it. */
  code: { title: string; code: string };
  /** A link under the task, such as its plain-text copy. */
  twin?: ReactNode;
  /** The copy button's labels for the task. */
  copyLabel: string;
  copiedLabel: string;
}

/*
 * A task to hand to a coding agent, closed until the reader opens it: a card whose summary line opens the lead, the task's text with Copy (long lines wrap, it is prose) and a link to its plain-text copy. The kit's Collapsible holds the behaviour, the kit's Card the frame; the chevron shows the state.
 */
// @cpt-dod:cpt-template-site-blocks-dod-docs-blocks-agent-task:p1
// @cpt-flow:cpt-template-site-blocks-flow-docs-blocks-open-agent-task:p1
export function AgentTask({ id, summary, lead, code, twin, copyLabel, copiedLabel }: AgentTaskProps) {
  // @cpt-begin:cpt-template-site-blocks-flow-docs-blocks-open-agent-task:p1:inst-hold-state
  const [open, setOpen] = useState(false);
  const Chevron = open ? ChevronDown : ChevronRight;
  // @cpt-end:cpt-template-site-blocks-flow-docs-blocks-open-agent-task:p1:inst-hold-state
  return (
    <Card id={id} className={styles.task}>
      <Collapsible open={open} onOpenChange={setOpen} className={styles.collapsible}>
        {/* @cpt-begin:cpt-template-site-blocks-flow-docs-blocks-open-agent-task:p1:inst-summary */}
        <CardHeader>
          <CollapsibleTrigger className={styles.trigger}>
            <Chevron aria-hidden="true" className={styles.chevron} />
            <CardTitle render={createElement('span')}>{summary}</CardTitle>
          </CollapsibleTrigger>
        </CardHeader>
        {/* @cpt-end:cpt-template-site-blocks-flow-docs-blocks-open-agent-task:p1:inst-summary */}
        {/* @cpt-begin:cpt-template-site-blocks-flow-docs-blocks-open-agent-task:p1:inst-open */}
        <CollapsibleContent>
          <CardContent className={styles.body}>
            {lead ? <Text tone="muted">{lead}</Text> : null}
            <CodeBlock code={code.code} label={code.title} wrap>
              <CodeBlockHeader>
                <CodeBlockTitle>{code.title}</CodeBlockTitle>
                <CodeBlockCopyButton copyLabel={copyLabel} copiedLabel={copiedLabel} />
              </CodeBlockHeader>
            </CodeBlock>
            {twin}
          </CardContent>
        </CollapsibleContent>
        {/* @cpt-end:cpt-template-site-blocks-flow-docs-blocks-open-agent-task:p1:inst-open */}
      </Collapsible>
    </Card>
  );
}
