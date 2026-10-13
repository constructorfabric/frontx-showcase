/**
 * Mail domain - the mock map for `MailApiService`.
 *
 * Same shape as the inbox's `mocks.ts`: keys are the full `METHOD /path`,
 * every read hands back a whole collection, and selection stays a
 * client-side concern (see `mailSelectors.ts`). The mailboxes and the earlier
 * messages are never written to, so they are served from the seed; the mails
 * are, since a sent mail joins them, so they are served from the package's
 * mail state (`mailMockStore.ts`). Every factory answers with a copy, so
 * nothing a screen does to a response reaches the state. A send the backend
 * would refuse throws a `MockRequestError` with its status
 * (`@inbox-shared/api/mockFailure`).
 */

import type { JsonValue, MockMap } from '@gears-frontx/react';
import { refuseRequest } from '@inbox-shared/api/mockFailure';
import { MAILBOX_SENT } from './constants';
import { mailboxes, mailMessages } from './mailDataset';
import { readMailMockState } from './mailMockStore';
import type {
  GetMailboxesResponse,
  GetMailMessagesResponse,
  GetMailsResponse,
  Mail,
  SendMailRequest,
  SendMailResponse,
} from './mailTypes';

const readString = (body: JsonValue | undefined, field: string): string | null => {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return null;
  const value = body[field];
  return typeof value === 'string' ? value : null;
};

// @cpt-algo:cpt-template-inbox-algo-mail-mock-send:p2
// @cpt-dod:cpt-template-inbox-dod-mail-service:p1
/**
 * The request a well-formed send carries; one a backend would reject is
 * refused with a 400: a recipient address is required, and so is a subject or a body
 * (an address alone is no mail, a bare subject line already is).
 */
const readSentMail = (body: JsonValue | undefined): SendMailRequest => {
  // @cpt-begin:cpt-template-inbox-algo-mail-mock-send:p2:inst-read-fields
  const correspondentEmail = readString(body, 'correspondentEmail')?.trim() ?? '';
  const subject = readString(body, 'subject') ?? '';
  const text = readString(body, 'body') ?? '';
  // @cpt-end:cpt-template-inbox-algo-mail-mock-send:p2:inst-read-fields
  // @cpt-begin:cpt-template-inbox-algo-mail-mock-send:p2:inst-refuse-no-recipient
  if (correspondentEmail === '') return refuseRequest(400, 'A mail needs a recipient address.');
  // @cpt-end:cpt-template-inbox-algo-mail-mock-send:p2:inst-refuse-no-recipient
  // @cpt-begin:cpt-template-inbox-algo-mail-mock-send:p2:inst-refuse-empty
  if (subject.trim() === '' && text.trim() === '') {
    return refuseRequest(400, 'A mail needs a subject or a body.');
  }
  // @cpt-end:cpt-template-inbox-algo-mail-mock-send:p2:inst-refuse-empty
  return {
    correspondentName: readString(body, 'correspondentName')?.trim() || correspondentEmail,
    correspondentEmail,
    subject,
    body: text,
    inReplyTo: readString(body, 'inReplyTo'),
  };
};

/**
 * Files the mail under Sent and answers with it. A real backend assigns the id
 * and the instant exactly here, which is why neither is taken from the request.
 */
const acceptSentMail = (request: SendMailRequest): Mail => {
  // @cpt-begin:cpt-template-inbox-algo-mail-mock-send:p2:inst-file-under-sent
  const state = readMailMockState();
  state.sentMailCount += 1;
  const mail: Mail = {
    id: `ml-sent-${state.sentMailCount}`,
    mailboxId: MAILBOX_SENT,
    correspondentName: request.correspondentName,
    correspondentEmail: request.correspondentEmail,
    subject: request.subject,
    snippet: request.body || request.subject,
    body: request.body,
    receivedAt: new Date().toISOString(),
    read: true,
    starred: false,
    pinned: false,
  };
  state.mails.push(mail);
  return mail;
  // @cpt-end:cpt-template-inbox-algo-mail-mock-send:p2:inst-file-under-sent
};

export const mailMockMap: MockMap = {
  // @cpt-begin:cpt-template-inbox-algo-mail-mock-send:p2:inst-serve-reads
  'GET /api/mail/mailboxes': (): GetMailboxesResponse => structuredClone({ mailboxes }),
  'GET /api/mail/mails': (): GetMailsResponse => structuredClone({ mails: readMailMockState().mails }),
  'GET /api/mail/messages': (): GetMailMessagesResponse => structuredClone({ mailMessages }),
  // @cpt-end:cpt-template-inbox-algo-mail-mock-send:p2:inst-serve-reads
  // @cpt-begin:cpt-template-inbox-algo-mail-mock-send:p2:inst-answer-filed
  'POST /api/mail/mails': (body): SendMailResponse => ({ mail: structuredClone(acceptSentMail(readSentMail(body))) }),
  // @cpt-end:cpt-template-inbox-algo-mail-mock-send:p2:inst-answer-filed
};
