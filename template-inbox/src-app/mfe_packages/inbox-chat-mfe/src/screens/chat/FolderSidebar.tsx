import { useId, useRef, useState, type FormEvent, type ReactElement } from 'react';
import { HashIcon, PlusIcon } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldLabel,
  Input,
} from '@gears-frontx/ui-kit';
import type { Translate } from '@inbox-shared/i18n/translate';
import type { Channel } from '@inbox-shared/api/types';
import { NavColumn } from '@inbox-shared/blocks/NavColumn';
import type { SidebarToggle } from '@inbox-shared/ui/useSidebarToggle';
import { usePortalContainer } from '@inbox-shared/lifecycle/screenContext';

const CHANNEL_ICON: Record<Channel['icon'], ReactElement> = {
  hash: <HashIcon />,
};

export type FolderSidebarProps = {
  channels: Channel[];
  selectedChannelId: string;
  onSelectChannel: (channelId: string) => void;
  onCreateChannel: (name: string) => void;
  column: SidebarToggle;
  t: Translate;
};

export function FolderSidebar({
  channels,
  selectedChannelId,
  onSelectChannel,
  onCreateChannel,
  column,
  t,
}: FolderSidebarProps) {
  const portalContainer = usePortalContainer();
  const nameFieldId = useId();
  const nameFieldRef = useRef<HTMLInputElement>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed === '') return;
    onCreateChannel(trimmed);
    setName('');
    setCreateOpen(false);
  };

  return (
    <NavColumn
      state={column}
      label={t('channels')}
      title={t('chat')}
      closeLabel={t('close')}
      items={channels.map((channel) => ({
        id: channel.id,
        label: channel.label,
        icon: CHANNEL_ICON[channel.icon],
        count: channel.itemCount,
      }))}
      selectedId={selectedChannelId}
      onSelect={onSelectChannel}
      actions={
        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) setName('');
          }}
        >
          <DialogTrigger
            render={
              <Button variant="ghost" size="sm" icon={<PlusIcon />} aria-label={t('new_channel')} />
            }
          />
          {/* The dialog opens on the name field, the one thing it asks for. */}
          <DialogContent container={portalContainer} initialFocus={nameFieldRef}>
            <form onSubmit={submit}>
              <DialogHeader>
                <DialogTitle>{t('new_channel')}</DialogTitle>
              </DialogHeader>
              <Field>
                <FieldLabel htmlFor={nameFieldId}>{t('channel_name')}</FieldLabel>
                <Input
                  id={nameFieldId}
                  value={name}
                  onValueChange={setName}
                  ref={nameFieldRef}
                  placeholder={t('channel_name_placeholder')}
                />
              </Field>
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline" />}>
                  {t('cancel')}
                </DialogClose>
                <Button type="submit" disabled={name.trim() === ''}>
                  {t('create_channel')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    />
  );
}
