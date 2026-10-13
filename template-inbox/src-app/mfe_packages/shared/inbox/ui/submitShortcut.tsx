import { useCallback, type KeyboardEvent } from 'react';
import type { Translate } from '../i18n/translate';

/**
 * Apple platforms send with Command+Enter, everything else with Ctrl+Enter.
 * `userAgent` rather than the deprecated `navigator.platform`; either key is
 * accepted everywhere, so a misread platform only mislabels the hint.
 */
export const isApplePlatform = (): boolean =>
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

/**
 * The composer's "Cmd+Enter to send" hint, as plain text from the catalogue
 * (the `ReplyComposer` block sets it in the muted meta role):
 * `send_shortcut` places the keys (`{keys}`) in the sentence and
 * `key_combination` joins them, so a language that orders either differently
 * only changes the catalogue.
 *
 * Text rather than the kit's `Kbd` chips: `Kbd` paints `--muted`, which is
 * the same colour as the page background in both themes (and dark `--card`
 * matches it too), so on any surface this app has the chips vanish and the
 * hint reads "Cmd  Enter to send".
 */
export function SubmitShortcutHint({ t }: { t: Translate }) {
  const keys = t('key_combination', {
    modifier: isApplePlatform() ? t('key_command') : t('key_control'),
    key: t('key_enter'),
  });
  return <span>{t('send_shortcut', { keys })}</span>;
}

/**
 * The key handler both composers put on their textarea: Cmd+Enter or
 * Ctrl+Enter submits while `enabled`. A keystroke that is still composing
 * text in an input method (`isComposing`) is the IME's, not a submit.
 */
// @cpt-algo:cpt-template-inbox-algo-screen-frame-submit-shortcut:p2
// @cpt-dod:cpt-template-inbox-dod-screen-frame-shared-components:p2
export function useSubmitShortcut(onSubmit: () => void, enabled: boolean) {
  return useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      // @cpt-begin:cpt-template-inbox-algo-screen-frame-submit-shortcut:p2:inst-ignore-other-keys
      if (event.key !== 'Enter' || !(event.metaKey || event.ctrlKey)) return;
      // @cpt-end:cpt-template-inbox-algo-screen-frame-submit-shortcut:p2:inst-ignore-other-keys
      // @cpt-begin:cpt-template-inbox-algo-screen-frame-submit-shortcut:p2:inst-ignore-composing
      if (event.nativeEvent.isComposing || !enabled) return;
      // @cpt-end:cpt-template-inbox-algo-screen-frame-submit-shortcut:p2:inst-ignore-composing
      // @cpt-begin:cpt-template-inbox-algo-screen-frame-submit-shortcut:p2:inst-submit
      event.preventDefault();
      onSubmit();
      // @cpt-end:cpt-template-inbox-algo-screen-frame-submit-shortcut:p2:inst-submit
    },
    [onSubmit, enabled]
  );
}
