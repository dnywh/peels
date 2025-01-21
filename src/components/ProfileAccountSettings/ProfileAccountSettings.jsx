"use client";
import { useState, useCallback, useEffect } from "react";
import Button from "@/components/Button";
import Form from "@/components/Form";
import Field from "@/components/Field";
import Label from "@/components/Label";
import Input from "@/components/Input";
import SubmitButton from "@/components/SubmitButton";
import InputHint from "@/components/InputHint";

import {
  updateFirstNameAction,
  sendPasswordResetEmailAction,
  sendEmailChangeEmailAction,
} from "@/app/actions";

import { styled } from "@pigment-css/react";
import { validateFirstName, FIELD_CONFIGS } from "@/lib/formValidation";

const List = styled("ul")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  // gap: `calc(${theme.spacing.unit} * 1)`,
}));

const ListItemStatic = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: theme.spacing.unit,
  flex: 1,
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
  const password = useEditableField();

  const [tempFirstName, setTempFirstName] = useState(profile?.first_name);

  const handlePasswordUpdate = async (formData) => {
    password.setIsUpdating(true);
    password.setError(null);
    try {
      const result = await sendPasswordResetEmailAction(formData);
      if (result?.error) {
        password.setError(result.error);
      } else {
        password.setSuccess(true);
        password.setLastSentAt(Date.now());
      }
    } catch (error) {
      console.error("Error updating password:", error);
      password.setError("Sorry, something’s gone wrong. Please try again.");
    } finally {
      password.setIsUpdating(false);
    }
  };

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

      <ListItem editing={password.isEditing}>
        {password.isEditing ? (
          <Form nested={true} action={handlePasswordUpdate}>
            <Field>
              <Label>Password</Label>
              <Input
                name="password"
                {...FIELD_CONFIGS.password}
                disabled={true}
              />
              <InputHint>
                {password.success
                  ? "Done. Check your email for the password reset link."
                  : "You can change your password by sending a password reset link to your email, below."}
              </InputHint>
            </Field>
            <ButtonGroup>
              {!password.success && (
                <SubmitButton
                  disabled={password.isUpdating}
                  pendingText="Sending..."
                >
                  Send the link
                </SubmitButton>
              )}
              <Button
                variant="secondary"
                onClick={() => password.reset()}
                disabled={password.isUpdating}
              >
                {password.success ? "Close" : "Cancel"}
              </Button>
            </ButtonGroup>
          </Form>
        ) : (
          <>
            <ListItemReadField>
              <Label>Password</Label>
              <PasswordPreview>
                {FIELD_CONFIGS.password.placeholder}
              </PasswordPreview>
            </ListItemReadField>
            <Button
              variant="secondary"
              onClick={() => password.setIsEditing(true)}
            >
              Edit
            </Button>
          </>
        )}
      </ListItem>
    </List>
  );
}

export default ProfileAccountSettings;
