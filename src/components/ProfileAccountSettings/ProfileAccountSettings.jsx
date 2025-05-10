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
  sendEmailChangeEmailAction,
} from "@/app/actions";

import { styled } from "@pigment-css/react";
import { validateFirstName, FIELD_CONFIGS } from "@/lib/formValidation";

const List = styled("ul")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: ` 0 calc(${theme.spacing.unit} * 1.5) calc(${theme.spacing.unit} * 1.5)`, // Visually match parent padding
  // gap: `calc(${theme.spacing.unit} * 1)`,
}));

const ListItem = styled("li")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",

  borderStyle: "solid",
  borderWidth: "0px",
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

// New custom hook for managing edit states
function useEditableField(initialState = false) {
  const [isEditing, setIsEditing] = useState(initialState);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
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

function ProfileAccountSettings({ user, profile }) {
  // Use our custom hook for each editable field
  const firstName = useEditableField();
  const email = useEditableField();
  const newsletterPreference = useEditableField();

  const [tempFirstName, setTempFirstName] = useState(profile?.first_name);
  const [tempNewsletterPreference, setTempNewsletterPreference] = useState(
    profile?.newsletter
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

  const handleEmailUpdate = async (formData) => {
    const newEmail = formData.get("email")?.toString();

    // Client-side validation for unchanged email
    if (newEmail === user.email) {
      email.setError("This is already your email address.");
      return;
    }

    email.setIsUpdating(true);
    email.setError(null);

    try {
      const result = await sendEmailChangeEmailAction(formData);
      if (result?.error) {
        email.setError(result.error);
      } else {
        email.setSuccess(true);
      }
    } catch (error) {
      console.error("Error updating email:", error);
      email.setError("Sorry, something’s gone wrong. Please try again.");
    } finally {
      email.setIsUpdating(false);
    }
  };

  const handleFirstNameUpdate = async (formData) => {
    const validation = validateFirstName(formData.get("first_name"));
    if (!validation.isValid) {
      firstName.setError(validation.error);
      return;
    }

    firstName.setIsUpdating(true);
    firstName.setError(null);

    try {
      const result = await updateFirstNameAction(formData);
      if (result?.error) {
        firstName.setError(result.error);
      } else {
        setTempFirstName(validation.value);
        firstName.setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating first name:", error);
      firstName.setError("Sorry, something’s gone wrong. Please try again.");
    } finally {
      firstName.setIsUpdating(false);
    }
  };

  const handleFirstNameCancel = () => {
    firstName.reset();
  };

  const handleNewslettePreferenceUpdate = async (formData) => {
    const nextNewsletterPreference =
      formData.get("newsletter_preference") === "true";
    console.log("Updating newsletter preference to", nextNewsletterPreference);

    newsletterPreference.setIsUpdating(true);

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
      newsletterPreference.setError(
        "Sorry, something’s gone wrong. Please try again."
      );
    } finally {
      newsletterPreference.setIsUpdating(false);
    }
  };

  const handleNewsletterPreferenceCancel = () => {
    setTempNewsletterPreference(profile?.newsletter);
    newsletterPreference.reset();
  };

  return (
    <List>
      <ListItem editing={firstName.isEditing}>
        {firstName.isEditing ? (
          <Form nested={true} action={handleFirstNameUpdate}>
            <Field>
              <Label>First name</Label>
              <Input
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
                pendingText="Updating..."
              >
                Update
              </SubmitButton>
              <Button
                variant="secondary"
                onClick={handleFirstNameCancel}
                disabled={firstName.isUpdating}
              >
                Cancel
              </Button>
            </ButtonGroup>
          </Form>
        ) : (
          <>
            <ListItemReadField>
              <Label>First name</Label>
              <p>{tempFirstName}</p>
            </ListItemReadField>
            <Button
              variant="secondary"
              onClick={() => firstName.setIsEditing(true)}
            >
              Edit
            </Button>
          </>
        )}
      </ListItem>

      <ListItem editing={email.isEditing}>
        {email.isEditing ? (
          <Form nested={true} action={handleEmailUpdate}>
            <Field>
              <Label>Email</Label>
              <Input
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
                    ? "Check your email for the verification link."
                    : "We’ll send a verification link to this email."}
              </InputHint>
            </Field>
            <ButtonGroup>
              {!email.success && (
                <SubmitButton
                  disabled={email.isUpdating}
                  pendingText="Sending..."
                >
                  Send the link
                </SubmitButton>
              )}
              <Button
                variant="secondary"
                onClick={() => email.reset()}
                disabled={email.isUpdating}
              >
                {email.success ? "Close" : "Cancel"}
              </Button>
            </ButtonGroup>
          </Form>
        ) : (
          <>
            <ListItemReadField>
              <Label>Email</Label>
              <p>{user.email}</p>
            </ListItemReadField>
            <Button
              variant="secondary"
              onClick={() => email.setIsEditing(true)}
            >
              Edit
            </Button>
          </>
        )}
      </ListItem>

      <ListItem editing={newsletterPreference.isEditing}>
        {newsletterPreference.isEditing ? (
          <Form nested={true} action={handleNewslettePreferenceUpdate}>
            <Field>
              <Label>Newsletter</Label>
              <Select
                name="newsletter_preference"
                value={tempNewsletterPreference}
                onChange={(event) =>
                  setTempNewsletterPreference(event.target.value === "true")
                }
                required={true}
              >
                <option value="false">Not subscribed</option>
                <option value="true">Subscribed</option>
              </Select>
              <InputHint
                variant={newsletterPreference.error ? "error" : "default"}
              >
                {newsletterPreference.error
                  ? newsletterPreference.error
                  : tempNewsletterPreference
                    ? "We’ll send you occasional email updates about Peels."
                    : "We’ll only send you necessary account or listing-related emails. "}
              </InputHint>
            </Field>

            <ButtonGroup>
              <SubmitButton
                disabled={newsletterPreference.isUpdating}
                pendingText="Updating..."
              >
                Update
              </SubmitButton>
              <Button
                variant="secondary"
                onClick={handleNewsletterPreferenceCancel}
                disabled={newsletterPreference.isUpdating}
              >
                Cancel
              </Button>
            </ButtonGroup>
          </Form>
        ) : (
          <>
            <ListItemReadField>
              <Label>Newsletter</Label>
              <p>
                {tempNewsletterPreference === true
                  ? "Subscribed"
                  : "Not subscribed"}
              </p>
            </ListItemReadField>
            <Button
              variant="secondary"
              onClick={() => newsletterPreference.setIsEditing(true)}
            >
              Edit
            </Button>
          </>
        )}
      </ListItem>

      <ListItem>
        <>
          <ListItemReadField>
            <Label>Password</Label>
            <PasswordPreview>
              {FIELD_CONFIGS.password.placeholder}
            </PasswordPreview>
          </ListItemReadField>
          <Button variant="secondary" href="/profile/reset-password">
            Edit
          </Button>
        </>
      </ListItem>
    </List>
  );
}

export default ProfileAccountSettings;
