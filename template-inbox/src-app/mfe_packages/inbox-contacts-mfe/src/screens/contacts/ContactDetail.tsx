import { useId, type ReactElement } from 'react';
import {
  ArrowLeftIcon,
  MessageCircleIcon,
  TicketIcon,
  UserCheckIcon,
  UserPlusIcon,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Field,
  FieldGroup,
  FieldLabel,
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
  StatusDot,
  Textarea,
} from '@gears-frontx/ui-kit';
import { DescriptionList, Heading, Text } from '@gears-frontx/kit-candidates';
import type { Contact, Conversation, TicketPriority } from '@inbox-shared/api/types';
import { absoluteDate, labelOf, longRelativeTime } from '@inbox-shared/ui/format';
import type { Translate } from '@inbox-shared/i18n/translate';
import { FieldRow } from '@inbox-shared/ui/FieldRow';
import { ColumnsLayout } from '@inbox-shared/blocks/ColumnsLayout';
import { ContactSummary } from '@inbox-shared/blocks/ContactSummary';
import { PagePane, PagePaneBody, PagePaneHeader } from '@inbox-shared/blocks/PagePane';
import { PresenceAvatar } from '@inbox-shared/blocks/PresenceAvatar';
import { RecordList } from '@inbox-shared/blocks/RecordList';
import { ChipRow } from '@inbox-shared/blocks/ChipRow';
import { ScreenHeading } from '@inbox-shared/ui/ScreenHeading';
import { buildActivity, type ActivityKind } from './contactActivity';
import { CONTACT_TYPE_BADGE } from './contactTypeBadge';

const ACTIVITY_ICON: Record<ActivityKind, ReactElement> = {
  ticket: <TicketIcon />,
  conversation: <MessageCircleIcon />,
  'signed-up': <UserCheckIcon />,
  added: <UserPlusIcon />,
};

const PRIORITY_TONE: Record<TicketPriority, 'danger' | 'warning' | 'neutral'> = {
  urgent: 'danger',
  high: 'danger',
  medium: 'warning',
  low: 'neutral',
};

type CheckRowProps = { label: string; done: boolean };

/**
 * One line of the lead-qualification checklist: a read-only kit checkbox
 * with its label. Derived from whether the field is filled in rather than
 * stored: a "complete" flag that disagreed with the record it summarises
 * would be worse than no flag.
 */
function CheckRow({ label, done }: CheckRowProps) {
  const id = useId();
  return (
    <Field orientation="horizontal">
      <Checkbox id={id} checked={done} readOnly />
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
    </Field>
  );
}

export type ContactDetailProps = {
  contact: Contact;
  /**
   * The contact's conversations, joined from `contact.conversations` against
   * the inbox's own collection; a ref with no conversation behind it is left
   * out rather than rendered.
   */
  conversations: Conversation[];
  /** When each conversation started, by id (`conversationStarts`). */
  conversationStartedAt: ReadonlyMap<string, string>;
  onBack: () => void;
  t: Translate;
};

export function ContactDetail({ contact, conversations, conversationStartedAt, onBack, t }: ContactDetailProps) {
  const activity = buildActivity(contact, conversations, conversationStartedAt);

  const typeBadge = <Badge variant={CONTACT_TYPE_BADGE[contact.type]}>{labelOf(contact.type, t)}</Badge>;

  return (
    <PagePane>
      <PagePaneHeader
        leading={
          <>
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowLeftIcon />}
              aria-label={t('back_to_contacts')}
              onClick={onBack}
            />
            <PresenceAvatar name={contact.name} presence={contact.presence} size="lg" t={t} />
          </>
        }
        heading={
          <Heading size="heading-2" render={<ScreenHeading />}>
            {contact.name}
          </Heading>
        }
        after={
          <>
            {typeBadge}
            <Text variant="meta" tone="muted" render={<span />}>
              {labelOf(contact.presence, t)}
            </Text>
          </>
        }
      />

      <PagePaneBody>
        <ColumnsLayout
          start={
            <>
              <Card size="sm">
                <CardContent>
                  <ContactSummary
                    avatar={<PresenceAvatar name={contact.name} presence={contact.presence} size="lg" t={t} />}
                    name={contact.name}
                    meta={contact.email}
                    badge={typeBadge}
                  />
                </CardContent>
              </Card>

              <Card size="sm">
                <CardHeader>
                  <CardTitle>{t('details')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <DescriptionList orientation="horizontal" size="sm">
                    <FieldRow label={t('company')} value={contact.company} />
                    <FieldRow label={t('job_title')} value={contact.jobTitle} />
                    <FieldRow label={t('phone')} value={contact.phone} />
                    <FieldRow label={t('location')} value={contact.location} />
                  </DescriptionList>
                </CardContent>
              </Card>

              <Card size="sm">
                <CardHeader>
                  <CardTitle>{t('qualification')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <CheckRow label={t('name')} done={contact.name !== ''} />
                    <CheckRow label={t('email')} done={contact.email !== ''} />
                    <CheckRow label={t('phone')} done={contact.phone !== ''} />
                    <CheckRow label={t('company')} done={contact.company !== ''} />
                    <CheckRow label={t('job_title')} done={contact.jobTitle !== ''} />
                    <CheckRow label={t('location')} done={contact.location !== ''} />
                  </FieldGroup>
                </CardContent>
              </Card>

              <Card size="sm">
                <CardHeader>
                  <CardTitle>{t('activity')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <DescriptionList orientation="horizontal" size="sm">
                    <FieldRow label={t('signed_up')} value={absoluteDate(contact.signedUpAt)} />
                    <FieldRow label={t('last_seen')} value={longRelativeTime(contact.lastSeenAt, t)} />
                    <FieldRow label={t('added')} value={absoluteDate(contact.addedAt)} />
                    <FieldRow label={t('tickets')} value={String(contact.tickets.length)} />
                  </DescriptionList>
                </CardContent>
              </Card>

              <Card size="sm">
                <CardHeader>
                  <CardTitle>{t('tags')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {contact.tags.length === 0 ? (
                    <Text variant="meta" tone="muted" render={<span />}>
                      {t('no_tags')}
                    </Text>
                  ) : (
                    <ChipRow>
                      {contact.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </ChipRow>
                  )}
                </CardContent>
              </Card>

              <Card size="sm">
                <CardHeader>
                  <CardTitle>{t('notes')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {/*
                    Uncontrolled and keyed by contact: the note is a private
                    scratchpad, and this template ships no
                    endpoint that would persist an edit.
                  */}
                  <Textarea
                    key={contact.id}
                    rows={4}
                    defaultValue={contact.notes}
                    placeholder={t('notes_placeholder')}
                    aria-label={t('notes')}
                  />
                </CardContent>
              </Card>
            </>
          }
          main={
            <>
              <Card size="sm">
                <CardHeader>
                  <CardTitle>{t('tickets_count', { count: contact.tickets.length })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {contact.tickets.length === 0 ? (
                    <Text variant="meta" tone="muted" render={<span />}>
                      {t('no_tickets')}
                    </Text>
                  ) : (
                    <RecordList
                      items={contact.tickets.map((ticket) => ({
                        id: ticket.id,
                        title: ticket.subject,
                        description: t('ticket_meta', { number: ticket.number, date: absoluteDate(ticket.openedAt) }),
                        trailing: (
                          <>
                            <StatusDot tone={PRIORITY_TONE[ticket.priority]} label={labelOf(ticket.priority, t)} />
                            <Badge variant="secondary">{labelOf(ticket.status, t)}</Badge>
                          </>
                        ),
                      }))}
                    />
                  )}
                </CardContent>
              </Card>

              <Card size="sm">
                <CardHeader>
                  <CardTitle>{t('conversations_count', { count: conversations.length })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {conversations.length === 0 ? (
                    <Text variant="meta" tone="muted" render={<span />}>
                      {t('no_conversations')}
                    </Text>
                  ) : (
                    <RecordList
                      items={conversations.map((conversation) => ({
                        id: conversation.id,
                        title: conversation.subject,
                        meta: t('conversation_meta', {
                          channel: labelOf(conversation.channel, t),
                          time: longRelativeTime(conversation.lastActivityAt, t),
                        }),
                        description: conversation.snippet,
                      }))}
                    />
                  )}
                </CardContent>
              </Card>
            </>
          }
          end={
            <Card size="sm">
              <CardHeader>
                <CardTitle>{t('recent_activity')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ItemGroup>
                  {activity.map((entry) => (
                    <Item key={entry.id} size="xs" role="listitem">
                      <ItemMedia variant="icon">{ACTIVITY_ICON[entry.kind]}</ItemMedia>
                      <ItemContent>
                        <ItemTitle>{t(entry.labelKey, entry.labelParams)}</ItemTitle>
                        <ItemDescription>{longRelativeTime(entry.at, t)}</ItemDescription>
                      </ItemContent>
                    </Item>
                  ))}
                </ItemGroup>
              </CardContent>
            </Card>
          }
        />
      </PagePaneBody>
    </PagePane>
  );
}
