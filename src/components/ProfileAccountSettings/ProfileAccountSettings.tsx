"use client";
import { useState, useCallback } from "react";
import Button from "@/components/Button";
import Form from "@/components/Form";
import Field from "@/components/Field";
import Select from "@/components/Select";
import Label from "@/components/Label";
import Input from "@/components/Input";
import SubmitButton from "@/components/SubmitButton";
import InputHint from "@/components/InputHint";

import {
  updateFirstNameAction,
  updateNewsletterPreferenceAction,
  updatePreferredLocaleAction,
  sendEmailChangeEmailAction,
} from "@/app/actions";
import { localeLabels, locales, type Locale } from "@/i18n/config";

import { styled } from "@pigment-css/react";
import { validateFirstName, FIELD_CONFIGS } from "@/lib/formValidation";
import { useTranslations } from "next-intl";

const List = styled("ul")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: ` 0 calc(${theme.spacing.unit} * 1.5) calc(${theme.spacing.unit} * 1.5)`, // Visually match parent padding
  // gap: `calc(${theme.spacing.unit} * 1)`,
}));

const ListItem = styled("li")<{ editing?: boolean }>(({ theme }) => ({
  display: "flex",
  flexDirection: "row",

  borderStyle: "solid",
  borderColor: "transparent",
  transition: "border-color 25ms linear",
  // Assume middle row by default
  borderWidth: "1px 0",
  padding: "1rem 0",
  margin: "-0.5px 0",

  "&:first-child": {
    borderWidth: `0 0 1px`,
    padding: "0 0 1rem",
  },

  "&:last-child": {
    borderWidth: `1px 0 0`,
    padding: "1rem 0 0",
  },

  variants: [
    {
      props: { editing: true },
      style: {
        flexDirection: "column",
        borderColor: theme.colors.border.collide,
        transition: "border-color 800ms linear",
      },
    },
  ],
}));

const ListItemReadField = styled(Field)(({ theme }) => ({
  flex: 1,
}));

const ButtonGroup = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: theme.spacing.unit,
}));

const PasswordPreview = styled("p")(({ theme }) => ({
  color: theme.colors.text.ui.tertiary,
  userSelect: "none",
}));

const InputComponent = Input as React.ComponentType<any>;

// New custom hook for managing edit states
function useEditableField(initialState = false) {
  const [isEditing, setIsEditing] = useState(initialState);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [lastSentAt, setLastSentAt] = useState(0);

  const reset = useCallback(() => {
    setIsEditing(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    isEditing,
    setIsEditing,
    isUpdating,
    setIsUpdating,
    error,
    setError,
    success,
    setSuccess,
    lastSentAt,
    setLastSentAt,
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
};

function ProfileAccountSettings({
  user,
  profile,
}: ProfileAccountSettingsProps) {
  const t = useTranslations();
  // Use our custom hook for each editable field
  const firstName = useEditableField();
  const email = useEditableField();
  const newsletterPreference = useEditableField();
  const preferredLocale = useEditableField();

  const [tempFirstName, setTempFirstName] = useState(profile?.first_name);
  const [tempNewsletterPreference, setTempNewsletterPreference] = useState(
    profile?.is_newsletter_subscribed
  );
  const [tempPreferredLocale, setTempPreferredLocale] = useState<Locale>(
    profile?.preferred_locale ?? "en"
  );

  // const handlePasswordUpdate = async (formData) => {
  //   password.setIsUpdating(true);
  //   password.setError(null);
  //   try {
  //     const result = await sendPasswordResetEmailAction(formData);
  //     if (result?.error) {
  //       password.setError(result.error);
  //     } else {
  //       password.setSuccess(true);
  //       password.setLastSentAt(Date.now());
  //     }
  //   } catch (error) {
  //     console.error("Error updating password:", error);
  //     password.setError("Sorry, something’s gone wrong. Please try again.");
  //   } finally {
  //     password.setIsUpdating(false);
  //   }
  // };

  const handleEmailUpdate = async (formData: FormData) => {
    const newEmail = formData.get("email")?.toString();

    // Client-side validation for unchanged email
    if (newEmail === user.email) {
      email.setError(t("Errors.alreadyYourEmail"));
      return;
    }

    email.setIsUpdating(true);
    email.setError(null);
    formData.set("locale", tempPreferredLocale);

    try {
      const result = await sendEmailChangeEmailAction(formData);
      if (result?.error) {
        email.setError(result.error);
      } else {
        email.setSuccess(true);
      }
    } catch (error) {
      console.error("Error updating email:", error);
      email.setError(t("Errors.genericLater"));
    } finally {
      email.setIsUpdating(false);
    }
  };

  const handleFirstNameUpdate = async (formData: FormData) => {
    const validation = validateFirstName(formData.get("first_name"));
    if (!validation.isValid) {
      switch (validation.error) {
        case "empty":
          firstName.setError(t("Errors.emptyName"));
          break;
        case "tooShort":
          firstName.setError(t("Errors.firstNameTooShort"));
          break;
        case "tooLong":
          firstName.setError(t("Errors.firstNameTooLong"));
          break;
        case "invalidChars":
          firstName.setError(t("Errors.firstNameInvalidChars"));
          break;
        case "forbiddenContent":
        case "reserved":
          firstName.setError(t("Errors.firstNameNotAllowed"));
          break;
        default:
          firstName.setError(t("Errors.generic"));
      }
      return;
    }

    firstName.setIsUpdating(true);
    firstName.setError(null);

    try {
      const result = await updateFirstNameAction(formData);
      if (result?.error) {
        firstName.setError(result.error);
      } else {
        setTempFirstName(validation.value ?? "");
        firstName.setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating first name:", error);
      firstName.setError(t("Errors.genericLater"));
    } finally {
      firstName.setIsUpdating(false);
    }
  };

  const handleFirstNameCancel = () => {
    firstName.reset();
  };

  const handleNewsletterPreferenceUpdate = async (formData: FormData) => {
    const nextNewsletterPreference =
      formData.get("newsletter_preference") === "true";
    console.log("Updating newsletter preference to", nextNewsletterPreference);

    newsletterPreference.setIsUpdating(true);
    newsletterPreference.setError(null);

    try {
      const result = await updateNewsletterPreferenceAction(formData);
      if (result?.error) {
        newsletterPreference.setError(result.error);
      } else {
        setTempNewsletterPreference(nextNewsletterPreference);
        newsletterPreference.setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating newsletter preference:", error);
      newsletterPreference.setError(t("Errors.genericLater"));
    } finally {
      newsletterPreference.setIsUpdating(false);
    }
  };

  const handleNewsletterPreferenceCancel = () => {
    setTempNewsletterPreference(profile?.is_newsletter_subscribed);
    newsletterPreference.reset();
  };

  const handlePreferredLocaleUpdate = async (formData: FormData) => {
    preferredLocale.setIsUpdating(true);
    preferredLocale.setError(null);

    try {
      const result = await updatePreferredLocaleAction(formData);
      if (result?.error) {
        preferredLocale.setError(result.error);
      } else {
        preferredLocale.setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating preferred locale:", error);
      preferredLocale.setError(t("Errors.genericLater"));
    } finally {
      preferredLocale.setIsUpdating(false);
    }
  };

  const handlePreferredLocaleCancel = () => {
    setTempPreferredLocale(profile?.preferred_locale ?? "en");
    preferredLocale.reset();
  };

  return (
    <List>
      <ListItem editing={firstName.isEditing}>
        {firstName.isEditing ? (
          <Form nested={true} action={handleFirstNameUpdate}>
            <Field>
              <Label>{t("Profile.account.firstName")}</Label>
              <InputComponent
                name="first_name"
                {...FIELD_CONFIGS.firstName}
                defaultValue={tempFirstName}
                error={firstName.error}
              />
              {firstName.error && (
                <InputHint variant="error">{firstName.error}</InputHint>
              )}
            </Field>

            <ButtonGroup>
              <SubmitButton
                disabled={firstName.isUpdating}
                loading={firstName.isUpdating}
                pendingText={t("Status.updating")}
              >
                {t("Actions.update")}
              </SubmitButton>
              <Button
                variant="secondary"
                onClick={handleFirstNameCancel}
                disabled={firstName.isUpdating}
              >
                {t("Actions.cancel")}
              </Button>
            </ButtonGroup>
          </Form>
        ) : (
          <>
            <ListItemReadField>
              <Label>{t("Profile.account.firstName")}</Label>
              <p>{tempFirstName}</p>
            </ListItemReadField>
            <Button
              variant="secondary"
              onClick={() => firstName.setIsEditing(true)}
            >
              {t("Actions.edit")}
            </Button>
          </>
        )}
      </ListItem>

      <ListItem editing={email.isEditing}>
        {email.isEditing ? (
          <Form nested={true} action={handleEmailUpdate}>
            <Field>
              <Label>{t("Common.email")}</Label>
              <InputComponent
                name="email"
                defaultValue={user.email}
                {...FIELD_CONFIGS.email}
                error={email.error}
              />
              <InputHint
                variant={
                  email.error ? "error" : email.success ? "success" : "default"
                }
              >
                {email.error
                  ? email.error
                  : email.success
                    ? t("Profile.account.emailSuccess")
                    : t("Profile.account.emailHint")}
              </InputHint>
            </Field>
            <ButtonGroup>
              {!email.success && (
                <SubmitButton
                  disabled={email.isUpdating}
                  loading={email.isUpdating}
                  pendingText={t("Status.sending")}
                >
                  {t("Actions.sendLink")}
                </SubmitButton>
              )}
              <Button
                variant="secondary"
                onClick={() => email.reset()}
                disabled={email.isUpdating}
              >
                {email.success ? t("Actions.close") : t("Actions.cancel")}
              </Button>
            </ButtonGroup>
          </Form>
        ) : (
          <>
            <ListItemReadField>
              <Label>{t("Common.email")}</Label>
              <p>{user.email}</p>
            </ListItemReadField>
            <Button
              variant="secondary"
              onClick={() => email.setIsEditing(true)}
            >
              {t("Actions.edit")}
            </Button>
          </>
        )}
      </ListItem>

      <ListItem editing={newsletterPreference.isEditing}>
        {newsletterPreference.isEditing ? (
          <Form nested={true} action={handleNewsletterPreferenceUpdate}>
            <Field>
              <Label>{t("Common.newsletter")}</Label>
              <Select
                name="newsletter_preference"
                value={String(tempNewsletterPreference)}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                  setTempNewsletterPreference(event.target.value === "true")
                }
                required={true}
              >
                <option value="false">{t("Common.notSubscribed")}</option>
                <option value="true">{t("Common.subscribed")}</option>
              </Select>
              <InputHint
                variant={newsletterPreference.error ? "error" : "default"}
              >
                {newsletterPreference.error
                  ? newsletterPreference.error
                  : tempNewsletterPreference
                    ? t("Profile.account.newsletterSubscribedHint")
                    : t("Profile.account.newsletterNotSubscribedHint")}
              </InputHint>
            </Field>

            <ButtonGroup>
              <SubmitButton
                disabled={newsletterPreference.isUpdating}
                loading={newsletterPreference.isUpdating}
                pendingText={t("Status.updating")}
              >
                {t("Actions.update")}
              </SubmitButton>
              <Button
                variant="secondary"
                onClick={handleNewsletterPreferenceCancel}
                disabled={newsletterPreference.isUpdating}
              >
                {t("Actions.cancel")}
              </Button>
            </ButtonGroup>
          </Form>
        ) : (
          <>
            <ListItemReadField>
              <Label>{t("Common.newsletter")}</Label>
              <p>
                {tempNewsletterPreference === true
                  ? t("Common.subscribed")
                  : t("Common.notSubscribed")}
              </p>
            </ListItemReadField>
            <Button
              variant="secondary"
              onClick={() => newsletterPreference.setIsEditing(true)}
            >
              {t("Actions.edit")}
            </Button>
          </>
        )}
      </ListItem>

      <ListItem editing={preferredLocale.isEditing}>
        {preferredLocale.isEditing ? (
          <Form nested={true} action={handlePreferredLocaleUpdate}>
            <Field>
              <Label>{t("Common.language")}</Label>
              <Select
                name="preferred_locale"
                value={tempPreferredLocale}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                  setTempPreferredLocale(event.target.value as Locale)
                }
                required={true}
              >
                {locales.map((locale) => (
                  <option key={locale} value={locale}>
                    {localeLabels[locale]}
                  </option>
                ))}
              </Select>
              <InputHint variant={preferredLocale.error ? "error" : "default"}>
                {preferredLocale.error
                  ? preferredLocale.error
                  : t("Profile.account.languageHint")}
              </InputHint>
            </Field>

            <ButtonGroup>
              <SubmitButton
                disabled={preferredLocale.isUpdating}
                loading={preferredLocale.isUpdating}
                pendingText={t("Status.updating")}
              >
                {t("Actions.update")}
              </SubmitButton>
              <Button
                variant="secondary"
                onClick={handlePreferredLocaleCancel}
                disabled={preferredLocale.isUpdating}
              >
                {t("Actions.cancel")}
              </Button>
            </ButtonGroup>
          </Form>
        ) : (
          <>
            <ListItemReadField>
              <Label>{t("Common.language")}</Label>
              <p>{localeLabels[tempPreferredLocale]}</p>
            </ListItemReadField>
            <Button
              variant="secondary"
              onClick={() => preferredLocale.setIsEditing(true)}
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
