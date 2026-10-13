import type { ReactElement, ReactNode } from 'react';
import { XIcon } from 'lucide-react';
import {
  Badge,
  Button,
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from '@gears-frontx/ui-kit';
import { Heading } from '@gears-frontx/kit-candidates';
import { usePortalContainer } from '../../lifecycle/screenContext';
import { cx } from '../../ui/cx';
import type { SidebarToggle } from '../../ui/useSidebarToggle';
import styles from './NavColumn.module.css';

export type NavColumnItem = {
  id: string;
  label: string;
  /** A lucide icon before the label. */
  icon?: ReactElement;
  /** The count at the end of the row. */
  count: number;
};

export type NavColumnProps = {
  /** The column's open state, from `useSidebarToggle`. */
  state: SidebarToggle;
  /** The accessible name of the inline column. */
  label: string;
  /** The header title; in the sheet it also names the dialog. */
  title: string;
  /** The header's own buttons, after the title (a dialog trigger). */
  actions?: ReactNode;
  /** The rows: channels, mailboxes, filters. */
  items: NavColumnItem[];
  /** The row shown as the current one. */
  selectedId: string;
  onSelect: (id: string) => void;
  /** The name of the sheet's close button. */
  closeLabel: string;
  /** Out of the page entirely, not just folded (a screen showing something the column does not filter). */
  hidden?: boolean;
};

/** The rows: a list of buttons, the current one marked. */
function NavRows({ items, selectedId, onSelect }: Pick<NavColumnProps, 'items' | 'selectedId' | 'onSelect'>) {
  return (
    <nav className={styles.body}>
      <ItemGroup>
        {items.map((item) => {
          const selected = item.id === selectedId;
          return (
            // The kit's ItemGroup is a list; each row is a button, which cannot be the list item itself, so a box that lays nothing out carries the role.
            <div key={item.id} role="listitem" className={styles.listItem}>
              <Item
                size="sm"
                className={cx(styles.row, selected && styles.rowSelected)}
                variant={selected ? 'muted' : 'default'}
                render={
                  <button type="button" onClick={() => onSelect(item.id)} aria-current={selected ? 'true' : undefined} />
                }
              >
                {item.icon === undefined ? null : <ItemMedia variant="icon">{item.icon}</ItemMedia>}
                <ItemContent>
                  <ItemTitle>{item.label}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <Badge variant="secondary">{item.count}</Badge>
                </ItemActions>
              </Item>
            </div>
          );
        })}
      </ItemGroup>
    </nav>
  );
}

/**
 * A screen's secondary column (channels, mailboxes, contact filters), in the
 * form the width calls for.
 *
 * On a wide screen it is a column beside the list that folds to zero width.
 * Below the inline-column width (`state.overlay`) there is no room for it
 * beside the list and the thread: a column opened there would squeeze the
 * list to a sliver and its heading to nothing. So there it opens as the kit's
 * `Sheet` over the screen instead, which leaves the list at its own width
 * underneath and makes it inert while the sheet is open, and Escape, the
 * backdrop or the close button fold it again. The sheet portals into the
 * frame's portal node, so it stays inside the screen's shadow root.
 */
// @cpt-algo:cpt-template-inbox-algo-screen-frame-side-column:p2
// @cpt-dod:cpt-template-inbox-dod-screen-frame-container-layout:p2
// @cpt-dod:cpt-template-inbox-dod-screen-frame-blocks:p2
export function NavColumn({
  state,
  label,
  title,
  actions,
  items,
  selectedId,
  onSelect,
  closeLabel,
  hidden = false,
}: NavColumnProps) {
  const portalContainer = usePortalContainer();
  const rows = <NavRows items={items} selectedId={selectedId} onSelect={onSelect} />;
  // @cpt-begin:cpt-template-inbox-algo-screen-frame-side-column:p2:inst-render-sheet
  if (state.overlay) {
    return (
      <Sheet
        open={!state.collapsed && !hidden}
        onOpenChange={(open) => {
          if (!open) state.dismiss();
        }}
      >
        <SheetContent side="left" showCloseButton={false} className={styles.sheet} container={portalContainer}>
          <div className={styles.sheetFrame}>
            <div className={styles.header}>
              <SheetTitle>{title}</SheetTitle>
              <span className={styles.spacer} />
              {actions}
              <SheetClose render={<Button variant="ghost" size="sm" icon={<XIcon />} aria-label={closeLabel} />} />
            </div>
            {rows}
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  // @cpt-end:cpt-template-inbox-algo-screen-frame-side-column:p2:inst-render-sheet

  // @cpt-begin:cpt-template-inbox-algo-screen-frame-side-column:p2:inst-render-column
  return (
    <aside
      className={cx(styles.column, state.collapsed && styles.columnCollapsed)}
      aria-label={label}
      // Kept in the tree while collapsed so the width transition has something
      // to animate; `inert` takes its controls out of the tab order and
      // `aria-hidden` keeps a zero-width column from being read out.
      aria-hidden={state.collapsed}
      inert={state.collapsed}
      hidden={hidden}
    >
      <div className={styles.header}>
        <Heading size="heading-2" render={<span />} className={styles.title}>
          {title}
        </Heading>
        {actions ? (
          <>
            <span className={styles.spacer} />
            {actions}
          </>
        ) : null}
      </div>
      {rows}
    </aside>
  );
  // @cpt-end:cpt-template-inbox-algo-screen-frame-side-column:p2:inst-render-column
}
