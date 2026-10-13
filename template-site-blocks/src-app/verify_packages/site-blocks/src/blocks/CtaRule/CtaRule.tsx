import { useId, type ReactNode } from 'react';
import { Separator } from '@gears-frontx/ui-kit';
import { Heading, Text } from '@gears-frontx/kit-candidates';
import styles from './CtaRule.module.css';

export interface CtaRuleProps {
  title: string;
  text: string;
  /** The call to action, usually one text link. */
  action: ReactNode;
}

// @cpt-dod:cpt-template-site-blocks-dod-docs-blocks-cta-rule:p1
// @cpt-algo:cpt-template-site-blocks-algo-docs-blocks-cta-rule:p1
/** The call to action that closes an index: an open row under a rule, title and sentence on the left, the action at its end. */
export function CtaRule({ title, text, action }: CtaRuleProps) {
  const headingId = useId();
  return (
    // @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-cta-rule:p1:inst-rule
    <aside aria-labelledby={headingId}>
      <Separator />
      {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-cta-rule:p1:inst-rule */}
      {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-cta-rule:p1:inst-row */}
      <div className={styles.row}>
        <div className={styles.copy}>
          <Heading size="display" id={headingId}>
            {title}
          </Heading>
          <Text tone="muted">{text}</Text>
        </div>
        <div className={styles.action}>{action}</div>
      </div>
      {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-cta-rule:p1:inst-row */}
    </aside>
  );
}
