"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import Button from "@/components/Button";
import Field from "@/components/Field";
import Select from "@/components/Select";
import Label from "@/components/Label";
import Input from "@/components/Input";
import SubmitButton from "@/components/SubmitButton";
import InputHint from "@/components/InputHint";

import {
  defaultLocale,
  localeLabels,
  locales,
  type Locale,
} from "@/i18n/config";
import type { InlineActionResult } from "@/types/actionResult";

import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import { sharedInsetListStyles } from "@/styles/commonStyles";
import { FIELD_CONFIGS } from "@/lib/formValidation";
import { useTranslations } from "next-intl";

const editingListItemStyles = css`
  flex-direction: column;
  border-color: ${theme.colors.border.collide};
  transition: border-color 800ms linear;
`;

const List = styled.ul`
  ${sharedInsetListStyles};
`;

const ListItem = styled.li<{ $editing?: boolean }>`
  display: flex;
  flex-direction: row;
  border-style: solid;
  border-color: transparent;
  transition: border-color 25ms linear;
  border-width: 1px 0;
  padding: 1rem 0;
  margin: -0.5px 0;

  &:first-child {
    border-width: 0 0 1px;
    padding: 0 0 1rem;
  }

  &:last-child {
    border-width: 1px 0 0;
    padding: 1rem 0 0;
  }

  ${({ $editing }) => $editing && editingListItemStyles}
`;

const ListItemReadField = styled(Field)`
  flex: 1;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${theme.spacing.unit};
`;

const PasswordPreview = styled.p`
  color: ${theme.colors.text.ui.tertiary};
  user-select: none;
`;

const InputComponent = Input as React.ComponentType<any>;
const nestedFormStyle = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
} as const;

type FirstNameActionData = {
  firstName: string;
};

type EmailActionData = {
  email: string;
};

type NewsletterPreferenceActionData = {
  newsletterPreference: boolean;
};

type PreferredLocaleActionData = {
  preferredLocale: Locale;
};

type UpdateFirstNameFormAction = (
  previousState: InlineActionResult<FirstNameActionData>,
  formData: FormData
) => Promise<InlineActionResult<FirstNameActionData>>;

type SendEmailChangeFormAction = (
  previousState: InlineActionResult<EmailActionData>,
  formData: FormData
) => Promise<InlineActionResult<EmailActionData>>;

type UpdateNewsletterPreferenceFormAction = (
  previousState: InlineActionResult<NewsletterPreferenceActionData>,
  formData: FormData
) => Promise<InlineActionResult<NewsletterPreferenceActionData>>;

type UpdatePreferredLocaleFormAction = (
  previousState: InlineActionResult<PreferredLocaleActionData>,
  formData: FormData
) => Promise<InlineActionResult<PreferredLocaleActionData>>;

function getInitialInlineActionState<T>(): InlineActionResult<T> {
  return {
    success: false,
    error: null,
  };
}

function useEditableField(initialState = false) {
  const [isEditing, setIsEditing] = useState(initialState);

  const reset = useCallback(() => {
    setIsEditing(false);
  }, []);

  return {
    isEditing,
    setIsEditing,
    reset,
  };
}

type ProfileAccountSettingsProps = {
  user: {
    email: string;
  };
  profile: {
    first_name?: string;
    is_newsletter_subscribed?: boolean;
    preferred_locale?: Locale | null;
  };
  updateFirstNameAction: UpdateFirstNameFormAction;
  sendEmailChangeEmailAction: SendEmailChangeFormAction;
  updateNewsletterPreferenceAction: UpdateNewsletterPreferenceFormAction;
  updatePreferredLocaleAction: UpdatePreferredLocaleFormAction;
};

type FirstNameEditorProps = {
  currentFirstName?: string;
  action: UpdateFirstNameFormAction;
  onCancel: () => void;
  onSaved: (firstName: string) => void;
};

type EmailEditorProps = {
  action: SendEmailChangeFormAction;
  currentEmail: string;
  currentLocale: Locale;
  onCancel: () => void;
};

type NewsletterPreferenceEditorProps = {
  action: UpdateNewsletterPreferenceFormAction;
  currentPreference: boolean;
  onCancel: () => void;
  onPreferenceChange: (newsletterPreference: boolean) => void;
  onSaved: (newsletterPreference: boolean) => void;
};

type PreferredLocaleEditorProps = {
  action: UpdatePreferredLocaleFormAction;
  currentLocale: Locale;
  onCancel: () => void;
  onLocaleChange: (locale: Locale) => void;
  onSaved: (locale: Locale) => void;
};

function FirstNameEditor({
  action,
  currentFirstName,
  onCancel,
  onSaved,
}: FirstNameEditorProps) {
  const t = useTranslations();
  const [state, formAction, isPending] = useActionState(
    action,
    getInitialInlineActionState<FirstNameActionData>()
  );

  useEffect(() => {
    if (state.success && state.data?.firstName !== undefined) {
      onSaved(state.data.firstName);
    }
  }, [onSaved, state.data?.firstName, state.success]);

  return (
    <form style={nestedFormStyle} data-testid="profile-account-first-name-form">
      <Field>
        <Label>{t("Profile.account.firstName")}</Label>
        <InputComponent
          name="first_name"
          {...FIELD_CONFIGS.firstName}
          defaultValue={currentFirstName}
          error={state.error}
          data-testid="profile-account-first-name-input"
        />
        {state.error && <InputHint variant="error">{state.error}</InputHint>}
      </Field>

      <ButtonGroup>
        <SubmitButton
          formAction={formAction}
          pending={isPending}
          pendingText={t("Status.updating")}
          data-testid="profile-account-first-name-submit"
        >
          {t("Actions.update")}
        </SubmitButton>
        <Button variant="secondary" onClick={onCancel} disabled={isPending}>
          {t("Actions.cancel")}
        </Button>
      </ButtonGroup>
    </form>
  );
}

function EmailEditor({
  action,
  currentEmail,
  currentLocale,
  onCancel,
}: EmailEditorProps) {
  const t = useTranslations();
  const [state, formAction, isPending] = useActionState(
    action,
    getInitialInlineActionState<EmailActionData>()
  );

  return (
    <form style={nestedFormStyle} data-testid="profile-account-email-form">
      <input type="hidden" name="locale" value={currentLocale} />
      <Field>
        <Label>{t("Common.email")}</Label>
        <InputComponent
          name="email"
          defaultValue={currentEmail}
          {...FIELD_CONFIGS.email}
          error={state.error}
          data-testid="profile-account-email-input"
        />
        <InputHint
          variant={
            state.error ? "error" : state.success ? "success" : "default"
          }
        >
          {state.error
            ? state.error
            : state.success
              ? t("Profile.account.emailSuccess")
              : t("Profile.account.emailHint")}
        </InputHint>
      </Field>
      <ButtonGroup>
        {!state.success && (
          <SubmitButton
            formAction={formAction}
            pending={isPending}
            pendingText={t("Status.sending")}
            data-testid="profile-account-email-submit"
          >
            {t("Actions.sendLink")}
          </SubmitButton>
        )}
        <Button variant="secondary" onClick={onCancel} disabled={isPending}>
          {state.success ? t("Actions.close") : t("Actions.cancel")}
        </Button>
      </ButtonGroup>
    </form>
  );
}

function NewsletterPreferenceEditor({
  action,
  currentPreference,
  onCancel,
  onPreferenceChange,
  onSaved,
}: NewsletterPreferenceEditorProps) {
  const t = useTranslations();
  const [state, formAction, isPending] = useActionState(
    action,
    getInitialInlineActionState<NewsletterPreferenceActionData>()
  );

  useEffect(() => {
    if (state.success && state.data?.newsletterPreference !== undefined) {
      onSaved(state.data.newsletterPreference);
    }
  }, [onSaved, state.data?.newsletterPreference, state.success]);

  return (
    <form style={nestedFormStyle} data-testid="profile-account-newsletter-form">
      <Field>
        <Label>{t("Common.newsletter")}</Label>
        <Select
          name="newsletter_preference"
          value={String(currentPreference)}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
            onPreferenceChange(event.target.value === "true")
          }
          disabled={isPending}
          required={true}
          data-testid="profile-account-newsletter-input"
        >
          <option value="false">{t("Common.notSubscribed")}</option>
          <option value="true">{t("Common.subscribed")}</option>
        </Select>
        <InputHint variant={state.error ? "error" : "default"}>
          {state.error
            ? state.error
            : currentPreference
              ? t("Profile.account.newsletterSubscribedHint")
              : t("Profile.account.newsletterNotSubscribedHint")}
        </InputHint>
      </Field>

      <ButtonGroup>
        <SubmitButton
          formAction={formAction}
          pending={isPending}
          pendingText={t("Status.updating")}
          data-testid="profile-account-newsletter-submit"
        >
          {t("Actions.update")}
        </SubmitButton>
        <Button variant="secondary" onClick={onCancel} disabled={isPending}>
          {t("Actions.cancel")}
        </Button>
      </ButtonGroup>
    </form>
  );
}

function PreferredLocaleEditor({
  action,
  currentLocale,
  onCancel,
  onLocaleChange,
  onSaved,
}: PreferredLocaleEditorProps) {
  const t = useTranslations();
  const [state, formAction, isPending] = useActionState(
    action,
    getInitialInlineActionState<PreferredLocaleActionData>()
  );

  useEffect(() => {
    if (state.success && state.data?.preferredLocale !== undefined) {
      onSaved(state.data.preferredLocale);
    }
  }, [onSaved, state.data?.preferredLocale, state.success]);

  return (
    <form style={nestedFormStyle} data-testid="profile-account-language-form">
      <Field>
        <Label>{t("Common.language")}</Label>
        <Select
          name="preferred_locale"
          value={currentLocale}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
            onLocaleChange(event.target.value as Locale)
          }
          disabled={isPending}
          required={true}
          data-testid="profile-account-language-input"
        >
          {locales.map((locale) => (
            <option key={locale} value={locale}>
              {localeLabels[locale]}
            </option>
          ))}
        </Select>
        <InputHint variant={state.error ? "error" : "default"}>
          {state.error ? state.error : t("Profile.account.languageHint")}
        </InputHint>
      </Field>

      <ButtonGroup>
        <SubmitButton
          formAction={formAction}
          pending={isPending}
          pendingText={t("Status.updating")}
          data-testid="profile-account-language-submit"
        >
          {t("Actions.update")}
        </SubmitButton>
        <Button variant="secondary" onClick={onCancel} disabled={isPending}>
          {t("Actions.cancel")}
        </Button>
      </ButtonGroup>
    </form>
  );
}

function ProfileAccountSettings({
  user,
  profile,
  updateFirstNameAction,
  sendEmailChangeEmailAction,
  updateNewsletterPreferenceAction,
  updatePreferredLocaleAction,
}: ProfileAccountSettingsProps) {
  const t = useTranslations();
  const firstName = useEditableField();
  const email = useEditableField();
  const newsletterPreference = useEditableField();
  const preferredLocale = useEditableField();
  const [isHydrated, setIsHydrated] = useState(false);

  const [tempFirstName, setTempFirstName] = useState(profile?.first_name);
  const [tempNewsletterPreference, setTempNewsletterPreference] = useState(
    profile?.is_newsletter_subscribed ?? false
  );
  const [tempPreferredLocale, setTempPreferredLocale] = useState<Locale>(
    profile?.preferred_locale ?? defaultLocale
  );

  const handleFirstNameCancel = useCallback(() => {
    firstName.reset();
  }, [firstName.reset]);

  const handleFirstNameSaved = useCallback(
    (nextFirstName: string) => {
      setTempFirstName(nextFirstName);
      firstName.reset();
    },
    [firstName.reset]
  );

  const handleEmailCancel = useCallback(() => {
    email.reset();
  }, [email.reset]);

  const handleNewsletterPreferenceCancel = useCallback(() => {
    setTempNewsletterPreference(profile?.is_newsletter_subscribed ?? false);
    newsletterPreference.reset();
  }, [newsletterPreference.reset, profile?.is_newsletter_subscribed]);

  const handleNewsletterPreferenceSaved = useCallback(
    (nextNewsletterPreference: boolean) => {
      setTempNewsletterPreference(nextNewsletterPreference);
      newsletterPreference.reset();
    },
    [newsletterPreference.reset]
  );

  const handlePreferredLocaleCancel = useCallback(() => {
    setTempPreferredLocale(profile?.preferred_locale ?? defaultLocale);
    preferredLocale.reset();
  }, [preferredLocale.reset, profile?.preferred_locale]);

  const handlePreferredLocaleSaved = useCallback(
    (nextLocale: Locale) => {
      setTempPreferredLocale(nextLocale);
      preferredLocale.reset();
    },
    [preferredLocale.reset]
  );

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <List
      data-testid="profile-account-settings"
      data-hydrated={isHydrated ? "true" : "false"}
    >
      <ListItem $editing={firstName.isEditing}>
        {firstName.isEditing ? (
          <FirstNameEditor
            action={updateFirstNameAction}
            currentFirstName={tempFirstName}
            onCancel={handleFirstNameCancel}
            onSaved={handleFirstNameSaved}
          />
        ) : (
          <>
            <ListItemReadField>
              <Label>{t("Profile.account.firstName")}</Label>
              <p data-testid="profile-account-first-name-value">
                {tempFirstName}
              </p>
            </ListItemReadField>
            <Button
              variant="secondary"
              onClick={() => firstName.setIsEditing(true)}
              data-testid="profile-account-first-name-edit"
            >
              {t("Actions.edit")}
            </Button>
          </>
        )}
      </ListItem>

      <ListItem $editing={email.isEditing}>
        {email.isEditing ? (
          <EmailEditor
            action={sendEmailChangeEmailAction}
            currentEmail={user.email}
            currentLocale={tempPreferredLocale}
            onCancel={handleEmailCancel}
          />
        ) : (
          <>
            <ListItemReadField>
              <Label>{t("Common.email")}</Label>
              <p>{user.email}</p>
            </ListItemReadField>
            <Button
              variant="secondary"
              onClick={() => email.setIsEditing(true)}
              data-testid="profile-account-email-edit"
            >
              {t("Actions.edit")}
            </Button>
          </>
        )}
      </ListItem>

      <ListItem $editing={newsletterPreference.isEditing}>
        {newsletterPreference.isEditing ? (
          <NewsletterPreferenceEditor
            action={updateNewsletterPreferenceAction}
            currentPreference={tempNewsletterPreference}
            onCancel={handleNewsletterPreferenceCancel}
            onPreferenceChange={setTempNewsletterPreference}
            onSaved={handleNewsletterPreferenceSaved}
          />
        ) : (
          <>
            <ListItemReadField>
              <Label>{t("Common.newsletter")}</Label>
              <p data-testid="profile-account-newsletter-value">
                {tempNewsletterPreference
                  ? t("Common.subscribed")
                  : t("Common.notSubscribed")}
              </p>
            </ListItemReadField>
            <Button
              variant="secondary"
              onClick={() => newsletterPreference.setIsEditing(true)}
              data-testid="profile-account-newsletter-edit"
            >
              {t("Actions.edit")}
            </Button>
          </>
        )}
      </ListItem>

      <ListItem $editing={preferredLocale.isEditing}>
        {preferredLocale.isEditing ? (
          <PreferredLocaleEditor
            action={updatePreferredLocaleAction}
            currentLocale={tempPreferredLocale}
            onCancel={handlePreferredLocaleCancel}
            onLocaleChange={setTempPreferredLocale}
            onSaved={handlePreferredLocaleSaved}
          />
        ) : (
          <>
            <ListItemReadField>
              <Label>{t("Common.language")}</Label>
              <p data-testid="profile-account-language-value">
                {localeLabels[tempPreferredLocale]}
              </p>
            </ListItemReadField>
            <Button
              variant="secondary"
              onClick={() => preferredLocale.setIsEditing(true)}
              data-testid="profile-account-language-edit"
            >
              {t("Actions.edit")}
            </Button>
          </>
        )}
      </ListItem>

      <ListItem>
        <>
          <ListItemReadField>
            <Label>{t("Common.password")}</Label>
            <PasswordPreview>
              {FIELD_CONFIGS.password.placeholder}
            </PasswordPreview>
          </ListItemReadField>
          <Button variant="secondary" href="/profile/reset-password">
            {t("Actions.edit")}
          </Button>
        </>
      </ListItem>
    </List>
  );
}

export default ProfileAccountSettings;
