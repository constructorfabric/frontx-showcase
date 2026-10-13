import { BlockAnchor, type AnchorRender } from '../anchor';
import styles from './SectionTabs.module.css';

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export interface SectionTab {
  /** A stable key for the tab. */
  id: string;
  label: string;
  /** Where the tab leads, for a plain anchor. */
  href?: string;
  /** Draws the tab on the router's link instead. */
  render?: AnchorRender;
  /** `page` on the tab whose own page is open, `true` on the tab of the open page's section. */
  current?: 'page' | 'true';
  testId?: string;
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

// @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props
export interface SectionTabsProps {
  /** The accessible name of the bar's navigation. */
  label: string;
  tabs: readonly SectionTab[];
}
// @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-take-content-props

/** The section bar across the screen: one link per section, centred, the current one underlined in the brand colour. */
// @cpt-flow:cpt-template-catalogue-flow-catalogue-screen-navigate:p1
// @cpt-algo:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1
// @cpt-dod:cpt-template-catalogue-dod-catalogue-screen-blocks:p1
export function SectionTabs({ label, tabs }: SectionTabsProps) {
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-mark-section
  return (
    <div className={styles.bar}>
      <nav className={styles.tabs} aria-label={label}>
        {tabs.map((tab) => (
          // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-link
          <BlockAnchor
            key={tab.id}
            href={tab.href}
            render={tab.render}
            className={styles.tab}
            // @cpt-begin:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-mark-state
            aria-current={tab.current}
            // @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-mark-state
            data-testid={tab.testId}
          >
            {tab.label}
          </BlockAnchor>
          // @cpt-end:cpt-template-catalogue-algo-catalogue-screen-draw-block:p1:inst-draw-link
        ))}
      </nav>
    </div>
  );
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-navigate:p1:inst-mark-section
}
