import { apiRegistry, createFrontX, effects, mock } from '@gears-frontx/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { mailboxes as seedMailboxes, mailMessages as seedMailMessages, mails as seedMails } from './mailDataset';
import { resetMailMockState } from './mailMockStore';
import type { SendMailRequest } from './mailTypes';
import { getMailApi, registerMailApi } from './registerMailApi';

/** Reads the backend itself: the page's shared fetch cache would answer a read again within its stale time, and this suite reads straight after its own writes. */
const PAST_SHARED_FETCH_CACHE = { staleTime: 0 };

const REPLY: SendMailRequest = {
  correspondentName: 'Priya Natarajan',
  correspondentEmail: 'priya@northstar.example',
  subject: 'Re: Q3 planning doc ready for review',
  body: 'Looks good to me.',
  inReplyTo: 'ml-1',
};

/**
 * The suite that goes through the real service rather than around it, with
 * the app built the way `init.ts` builds it: the screen suite replaces
 * `useApiQuery`, so this is where a mock map that stops being reached, or a
 * package that forgot the framework's `mock()` plugin, shows up rather than
 * as an empty mailbox. Expectations are read off the seed, so editing the
 * content does not break the suite.
 */
describe('MailApiService', () => {
  beforeAll(() => {
    apiRegistry.reset();
    registerMailApi();
    apiRegistry.initialize();
    createFrontX().use(effects()).use(mock({ enabledByDefault: true })).build();
  });

  beforeEach(() => {
    resetMailMockState();
  });

  it('answers the mailbox list from the seeded dataset instead of the network', async () => {
    const { mailboxes } = await getMailApi().getMailboxes.fetch(PAST_SHARED_FETCH_CACHE);
    expect(mailboxes).toEqual(seedMailboxes);
  });

  it('serves every mail the mailbox counts are computed from', async () => {
    const { mails } = await getMailApi().getMails.fetch(PAST_SHARED_FETCH_CACHE);
    expect(mails).toEqual(seedMails);
    expect(mails.filter((mail) => !mail.read).length).toBeGreaterThan(0);
  });

  it('serves the history behind every mail that carries one', async () => {
    const { mailMessages } = await getMailApi().getMailMessages.fetch(PAST_SHARED_FETCH_CACHE);
    expect(mailMessages).toEqual(seedMailMessages);

    const mailIds = new Set(seedMails.map((mail) => mail.id));
    for (const message of mailMessages) {
      expect(mailIds.has(message.mailId)).toBe(true);
    }
  });

  it('files a sent mail under Sent with the id and instant the server assigns, and serves it from then on', async () => {
    const { mail } = await getMailApi().sendMail.fetch(REPLY);

    expect(mail).toMatchObject({
      id: 'ml-sent-1',
      mailboxId: 'sent',
      correspondentName: REPLY.correspondentName,
      correspondentEmail: REPLY.correspondentEmail,
      subject: REPLY.subject,
      body: REPLY.body,
      snippet: REPLY.body,
      read: true,
      starred: false,
      pinned: false,
    });
    expect(Number.isNaN(Date.parse(mail.receivedAt))).toBe(false);

    const { mails } = await getMailApi().getMails.fetch(PAST_SHARED_FETCH_CACHE);
    expect(mails).toHaveLength(seedMails.length + 1);
    expect(mails[mails.length - 1]).toEqual(mail);
  });

  it('names a composed mail after its address when no name comes with it, and previews a bare subject', async () => {
    const { mail } = await getMailApi().sendMail.fetch({
      correspondentName: '',
      correspondentEmail: 'devon@brightlabs.example',
      subject: 'Staging access',
      body: '',
      inReplyTo: null,
    });
    expect(mail.correspondentName).toBe('devon@brightlabs.example');
    expect(mail.snippet).toBe('Staging access');
  });

  it('rejects a mail without a recipient, or without a subject and a body, and keeps nothing', async () => {
    await expect(getMailApi().sendMail.fetch({ ...REPLY, correspondentEmail: ' ' })).rejects.toMatchObject({ status: 400 });
    await expect(getMailApi().sendMail.fetch({ ...REPLY, subject: '', body: '  ' })).rejects.toMatchObject({ status: 400 });

    const { mails } = await getMailApi().getMails.fetch(PAST_SHARED_FETCH_CACHE);
    expect(mails).toEqual(seedMails);
  });

  it("keeps the state in the package's own module: a second evaluation of the mock layer starts from the seed", async () => {
    await getMailApi().sendMail.fetch(REPLY);
    const { mails } = await getMailApi().getMails.fetch(PAST_SHARED_FETCH_CACHE);
    expect(mails.map((mail) => mail.id)).toContain('ml-sent-1');

    vi.resetModules();
    const fresh = await import('./mailMocks');
    const answer = fresh.mailMockMap['GET /api/mail/mails'](undefined) as { mails: { id: string }[] };
    expect(answer.mails.map((mail) => mail.id)).not.toContain('ml-sent-1');
    expect(answer.mails).toHaveLength(seedMails.length);
  });
});
