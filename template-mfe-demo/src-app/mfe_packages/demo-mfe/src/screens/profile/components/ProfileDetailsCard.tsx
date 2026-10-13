import React, { createElement, useMemo, useState } from 'react';
import {
  Alert,
  AlertDescription,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
} from '@gears-frontx/ui-kit';
import {
  Card,
  CardTitle,
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
  Text,
} from '@gears-frontx/kit-candidates';
import type { ApiUser } from '../../../api/types';
import { ActionRow } from '../../../blocks/ActionRow';

export type ProfileFormValues = {
  firstName: string;
  lastName: string;
  department: string;
};

interface ProfileDetailsCardProps {
  user: ApiUser;
  isSaving: boolean;
  saveErrorMessage?: string;
  t: (key: string) => string;
  onRefresh: () => void;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
}

// @cpt-dod:cpt-template-mfe-demo-dod-mfe-mechanics-demo-data-loading-screen:p1
// @cpt-algo:cpt-template-mfe-demo-algo-mfe-mechanics-demo-profile-form:p1
// @cpt-state:cpt-template-mfe-demo-state-mfe-mechanics-demo-profile-edit:p1
// @cpt-begin:cpt-template-mfe-demo-algo-mfe-mechanics-demo-profile-form:p1:inst-derive-values
/**
 * Read the form's three values off a profile.
 *
 * The names are coalesced although `ApiUser` types them as `string`: that type
 * describes a response body nothing validates, so a profile whose name fields
 * came back null reaches here as one. Every value below is trimmed and rendered
 * as a controlled input's value, and both of those turn a null into a thrown
 * render rather than an empty field. The values are trimmed here too, so the
 * saved profile and the edited form compare on the same terms: a stored
 * " Ada" is not a change the form has to save.
 */
function getFormValues(user: ApiUser): ProfileFormValues {
  return {
    firstName: (user.firstName ?? '').trim(),
    lastName: (user.lastName ?? '').trim(),
    department:
      typeof user.extra?.department === 'string' ? user.extra.department.trim() : '',
  };
}
// @cpt-end:cpt-template-mfe-demo-algo-mfe-mechanics-demo-profile-form:p1:inst-derive-values

export const ProfileDetailsCard: React.FC<ProfileDetailsCardProps> = ({
  user,
  isSaving,
  saveErrorMessage,
  t,
  onRefresh,
  onSubmit,
}) => {
  /*
   * The edit buffer is the only state the card holds, and its presence is what
   * "editing" means. The pair it replaces - an `isEditing` flag beside a
   * `formValues` copy - had to be re-synced from `user` in an effect whenever a
   * refetch delivered a new profile while the form was closed, and a setState
   * called synchronously in an effect body re-renders the card before paint
   * (`react-hooks/set-state-in-effect`). With the buffer absent outside editing,
   * the displayed values are derived from `user` on every render and there is
   * nothing left to re-sync; a refetch arriving mid-edit still leaves the
   * buffer alone, exactly as the effect's `!isEditing` guard did.
   */
  // @cpt-begin:cpt-template-mfe-demo-algo-mfe-mechanics-demo-profile-form:p1:inst-edit-buffer
  const [editingValues, setEditingValues] = useState<ProfileFormValues | null>(null);
  const isEditing = editingValues !== null;

  const initialValues = useMemo(() => getFormValues(user), [user]);
  const displayName = `${initialValues.firstName} ${initialValues.lastName}`.trim();
  const formValues = editingValues ?? initialValues;
  // @cpt-end:cpt-template-mfe-demo-algo-mfe-mechanics-demo-profile-form:p1:inst-edit-buffer
  // @cpt-begin:cpt-template-mfe-demo-algo-mfe-mechanics-demo-profile-form:p1:inst-dirty-valid
  const normalizedValues = useMemo(
    () => ({
      firstName: formValues.firstName.trim(),
      lastName: formValues.lastName.trim(),
      department: formValues.department.trim(),
    }),
    [formValues]
  );
  const isDirty =
    normalizedValues.firstName !== initialValues.firstName ||
    normalizedValues.lastName !== initialValues.lastName ||
    normalizedValues.department !== initialValues.department;
  const isFormValid =
    normalizedValues.firstName.length > 0 && normalizedValues.lastName.length > 0;
    // @cpt-end:cpt-template-mfe-demo-algo-mfe-mechanics-demo-profile-form:p1:inst-dirty-valid

  // @cpt-begin:cpt-template-mfe-demo-algo-mfe-mechanics-demo-profile-form:p1:inst-field-change
  const handleFieldChange =
    (field: keyof ProfileFormValues) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;

        // Only the editing branch renders these inputs, so there is always a
        // buffer to update. A change that somehow arrived after the buffer
        // closed is dropped: reopening the form from `user` is the Edit
        // button's decision, not this handler's.
        setEditingValues((current) =>
          current === null ? null : { ...current, [field]: value }
        );
      };
      // @cpt-end:cpt-template-mfe-demo-algo-mfe-mechanics-demo-profile-form:p1:inst-field-change

  // @cpt-begin:cpt-template-mfe-demo-state-mfe-mechanics-demo-profile-edit:p1:inst-cancel-edit
  const handleCancel = () => {
    setEditingValues(null);
  };
  // @cpt-end:cpt-template-mfe-demo-state-mfe-mechanics-demo-profile-edit:p1:inst-cancel-edit

  // @cpt-begin:cpt-template-mfe-demo-algo-mfe-mechanics-demo-profile-form:p1:inst-submit-guard
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isDirty || !isFormValid) {
      return;
    }
    // @cpt-end:cpt-template-mfe-demo-algo-mfe-mechanics-demo-profile-form:p1:inst-submit-guard

    // @cpt-begin:cpt-template-mfe-demo-algo-mfe-mechanics-demo-profile-form:p1:inst-submit-save
    try {
      await onSubmit(normalizedValues);
      // @cpt-end:cpt-template-mfe-demo-algo-mfe-mechanics-demo-profile-form:p1:inst-submit-save
      // @cpt-begin:cpt-template-mfe-demo-state-mfe-mechanics-demo-profile-edit:p1:inst-save-succeeded
      setEditingValues(null);
      // @cpt-end:cpt-template-mfe-demo-state-mfe-mechanics-demo-profile-edit:p1:inst-save-succeeded
    // @cpt-begin:cpt-template-mfe-demo-state-mfe-mechanics-demo-profile-edit:p1:inst-save-failed
    } catch {
      // Parent surfaces the error via saveErrorMessage; keep editing open.
    }
    // @cpt-end:cpt-template-mfe-demo-state-mfe-mechanics-demo-profile-edit:p1:inst-save-failed
  };

  // @cpt-begin:cpt-template-mfe-demo-algo-mfe-mechanics-demo-profile-form:p1:inst-render-body
  let body: React.ReactNode;
  if (isEditing) {
    body = (
      /*
       * The form sits inside CardContent rather than around the card's slots:
       * Card spaces its slots with `gap: var(--card-spacing)` on the card root,
       * so that rhythm only falls between Card's direct children. A wrapper
       * around them leaves the card a single child and the gap applies to
       * nothing, while the slots' horizontal padding still lands.
       */
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          {/*
            Field is layout only: it wires no ids and disables no control, so
            each label points at its input's own id and each input carries its
            own `disabled`. `data-disabled` on the Field is what dims the label
            alongside the control the kit's CSS already dims.
          */}
          <Field data-disabled={isSaving || undefined}>
            <FieldLabel htmlFor="profile-first-name">{t('first_name_label')}</FieldLabel>
            <Input
              id="profile-first-name"
              disabled={isSaving}
              value={formValues.firstName}
              onChange={handleFieldChange('firstName')}
            />
          </Field>

          <Field data-disabled={isSaving || undefined}>
            <FieldLabel htmlFor="profile-last-name">{t('last_name_label')}</FieldLabel>
            <Input
              id="profile-last-name"
              disabled={isSaving}
              value={formValues.lastName}
              onChange={handleFieldChange('lastName')}
            />
          </Field>

          <Field data-disabled={isSaving || undefined}>
            <FieldLabel htmlFor="profile-department">{t('department_label')}</FieldLabel>
            <Input
              id="profile-department"
              disabled={isSaving}
              value={formValues.department}
              onChange={handleFieldChange('department')}
            />
          </Field>

          {/*
            The save failure belongs to the request, not to any one control, so it
            stays outside the Fields rather than in a FieldError none of them owns.
          */}
          {saveErrorMessage ? (
            <Alert variant="destructive">
              <AlertDescription>{saveErrorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <ActionRow>
            <Button type="submit" disabled={!isDirty || !isFormValid || isSaving}>
              {isSaving ? t('saving') : t('save')}
            </Button>
            <Button type="button" variant="outline" disabled={isSaving} onClick={handleCancel}>
              {t('cancel')}
            </Button>
          </ActionRow>
        </FieldGroup>
      </form>
    );
  } else {
    body = (
      <DescriptionList size="sm">
        <DescriptionItem>
          <DescriptionTerm>{t('role_label')}</DescriptionTerm>
          <DescriptionDetails>{user.role}</DescriptionDetails>
        </DescriptionItem>
        {initialValues.department !== '' && (
          <DescriptionItem>
            <DescriptionTerm>{t('department_label')}</DescriptionTerm>
            <DescriptionDetails>{initialValues.department}</DescriptionDetails>
          </DescriptionItem>
        )}
        <DescriptionItem>
          <DescriptionTerm>{t('id_label')}</DescriptionTerm>
          <DescriptionDetails variant="mono">{user.id}</DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>{t('created_label')}</DescriptionTerm>
          <DescriptionDetails>{new Date(user.createdAt).toLocaleString()}</DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>{t('last_updated_label')}</DescriptionTerm>
          <DescriptionDetails>{new Date(user.updatedAt).toLocaleString()}</DescriptionDetails>
        </DescriptionItem>
      </DescriptionList>
    );
  }
  // @cpt-end:cpt-template-mfe-demo-algo-mfe-mechanics-demo-profile-form:p1:inst-render-body

  // @cpt-begin:cpt-template-mfe-demo-algo-mfe-mechanics-demo-profile-form:p1:inst-render-card
  // The avatar is decorative beside the name's own heading: its image carries no text alternative and its fallback initials are hidden from assistive technology.
  const initials = `${initialValues.firstName.charAt(0)}${initialValues.lastName.charAt(0)}`.toUpperCase();
  return (
    <Card>
      <CardHeader>
        <CardTitle render={createElement('h2')}>{displayName}</CardTitle>
        <CardDescription>
          <Text variant="mono" tone="muted" render={createElement('span')}>
            {user.email}
          </Text>
        </CardDescription>
        {user.avatarUrl ? (
          <CardAction>
            <Avatar size="lg">
              <AvatarImage src={user.avatarUrl} alt="" />
              <AvatarFallback aria-hidden="true">{initials}</AvatarFallback>
            </Avatar>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>{body}</CardContent>
      <CardFooter>
        <ActionRow>
          <Button data-testid="profile-refresh-button" onClick={onRefresh} disabled={isSaving}>
            {t('refresh')}
          </Button>
          {/* @cpt-begin:cpt-template-mfe-demo-state-mfe-mechanics-demo-profile-edit:p1:inst-start-edit */}
          {isEditing ? null : (
            <Button variant="outline" disabled={isSaving} onClick={() => setEditingValues(initialValues)}>
              {t('edit_profile')}
            </Button>
          )}
          {/* @cpt-end:cpt-template-mfe-demo-state-mfe-mechanics-demo-profile-edit:p1:inst-start-edit */}
        </ActionRow>
      </CardFooter>
    </Card>
  );
  // @cpt-end:cpt-template-mfe-demo-algo-mfe-mechanics-demo-profile-form:p1:inst-render-card
};

ProfileDetailsCard.displayName = 'ProfileDetailsCard';
