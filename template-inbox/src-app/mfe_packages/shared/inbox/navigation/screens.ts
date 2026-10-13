/**
 * The address tokens of the inbox screens: what the shell writes for a screen
 * in the page URL (`?screen=<token>`) and what `openScreen` names to open
 * one. Each equals the `route` of that screen's extension in its package's
 * `mfe.json`, without the leading slash; a test in `inbox-contacts-mfe` holds
 * every package's manifest to it.
 */
// @cpt-dod:cpt-template-inbox-dod-cross-screen-navigation-screen-ids:p1
export const INBOX_SCREENS = {
  contacts: 'inbox-contacts',
  dashboard: 'inbox-dashboard',
  chat: 'inbox-chat',
  mail: 'inbox-mail',
} as const;

export type InboxScreenToken = (typeof INBOX_SCREENS)[keyof typeof INBOX_SCREENS];

/**
 * The screen extension of each inbox screen, by its token: the subject of the
 * screen domain's `mount_ext` and the target of a chained action. Each equals
 * the screen extension's `id` in its package's `mfe.json`; the same test holds
 * them to the manifests.
 */
export const INBOX_SCREEN_EXTENSIONS: Record<InboxScreenToken, string> = {
  [INBOX_SCREENS.contacts]: 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.inbox_contacts.screens.contacts.v1',
  [INBOX_SCREENS.dashboard]: 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.inbox_dashboard.screens.dashboard.v1',
  [INBOX_SCREENS.chat]: 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.inbox_chat.screens.chat.v1',
  [INBOX_SCREENS.mail]: 'gts.frontx.mfes.ext.extension.v1~frontx.screensets.layout.screen.v1~frontx.inbox_mail.screens.mail.v1',
};
