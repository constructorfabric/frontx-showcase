/**
 * Popup Component
 *
 * The top entry of the layout's popup stack as a modal dialog on the kit's `Dialog`: it moves focus into the popup, keeps it there, closes on Escape and on the backdrop, returns focus to what opened it, and names the dialog by its title.
 */

import React from 'react';
import { closeTopPopup, useAppDispatch, useAppSelector, useTranslation, type PopupSliceState } from '@gears-frontx/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@gears-frontx/ui-kit';
import { layoutKey } from './i18n';
import styles from './Popup.module.css';

export interface PopupProps {
  children?: React.ReactNode;
}

// @cpt-algo:cpt-site-algo-shell-layout-navigation-page-frame:p1
export const Popup: React.FC<PopupProps> = ({ children }) => {
  // @cpt-begin:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-popup-overlay
  const popupState = useAppSelector((state) => state['layout/popup'] as PopupSliceState | undefined);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const stack = popupState?.stack ?? [];

  if (stack.length === 0) {
    return null;
  }

  const topPopup = stack[stack.length - 1];

  return (
    // Keyed by the popup's id so a second popup opened over the first gets its own focus scope.
    <Dialog key={topPopup.id} open onOpenChange={(open) => !open && dispatch(closeTopPopup())}>
      <DialogContent className={styles.dialog} showCloseButton={false} aria-label={topPopup.title ? undefined : t(layoutKey('popup.untitled'))}>
        {topPopup.title && (
          <DialogHeader>
            <DialogTitle>{topPopup.title}</DialogTitle>
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
  // @cpt-end:cpt-site-algo-shell-layout-navigation-page-frame:p1:inst-popup-overlay
};

Popup.displayName = 'Popup';
