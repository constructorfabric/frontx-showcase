import { useId, type ReactNode } from 'react';
import { CardContent, CardFooter, CardHeader } from '@gears-frontx/ui-kit';
import { Card, Heading, Text } from '@gears-frontx/kit-candidates';
import styles from './CtaBox.module.css';

export interface CtaBoxProps {
  title: string;
  text: string;
  /** The call to action, usually one button-styled link. */
  action: ReactNode;
}

// @cpt-dod:cpt-template-site-blocks-dod-docs-blocks-cta-box:p1
// @cpt-algo:cpt-template-site-blocks-algo-docs-blocks-cta-box:p1
/** The call to action that closes a guide: a tinted box with a large title, a sentence and one action under it. */
export function CtaBox({ title, text, action }: CtaBoxProps) {
  const headingId = useId();
  return (
    // @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-cta-box:p1:inst-region
    <aside aria-labelledby={headingId}>
      <Card className={styles.box}>
        {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-cta-box:p1:inst-region */}
        {/* @cpt-begin:cpt-template-site-blocks-algo-docs-blocks-cta-box:p1:inst-copy */}
        <CardHeader>
          <Heading size="display" id={headingId}>
            {title}
          </Heading>
        </CardHeader>
        <CardContent>
          <Text tone="muted">{text}</Text>
        </CardContent>
        <CardFooter>{action}</CardFooter>
        {/* @cpt-end:cpt-template-site-blocks-algo-docs-blocks-cta-box:p1:inst-copy */}
      </Card>
    </aside>
  );
}
