"use client";
import { useState } from "react";
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

function ProfileAccountSettings({ user, profile }) {
  const [isFirstNameEditing, setIsFirstNameEditing] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [isEmailEditing, setIsEmailEditing] = useState(false);

  const [firstName, setFirstName] = useState(profile?.first_name);
  const [tempFirstName, setTempFirstName] = useState(profile?.first_name);

  const [email, setEmail] = useState(user.email);

  const [isUpdatingFirstName, setIsUpdatingFirstName] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  const [firstNameUpdateError, setFirstNameUpdateError] = useState(null);

  const [emailUpdateSuccess, setEmailUpdateSuccess] = useState(false);
  const [emailUpdateError, setEmailUpdateError] = useState(null);

  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);
  const [passwordUpdateError, setPasswordUpdateError] = useState(null);

  const handlePasswordUpdate = async (formData) => {
    setIsUpdatingPassword(true);
    setPasswordUpdateError(null);
    try {
      const result = await sendPasswordResetEmailAction(formData);
      if (result?.error) {
        setPasswordUpdateError(result.error);
      } else {
        setPasswordUpdateSuccess(true);
      }
    } catch (error) {
      console.error("Error updating password:", error);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleEmailUpdate = async (formData) => {
    setIsUpdatingEmail(true);
    setEmailUpdateError(null);
    try {
      const result = await sendEmailChangeEmailAction(formData);
      if (result?.error) {
        setEmailUpdateError(result.error);
      } else {
        setEmailUpdateSuccess(true);
      }
    } catch (error) {
      console.error("Error updating email:", error);
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleFirstNameUpdate = async (formData) => {
    setIsUpdatingFirstName(true);
    setFirstNameUpdateError(null);
    try {
      const result = await updateFirstNameAction(formData);
      if (result?.error) {
        setFirstNameUpdateError(result.error);
        setTempFirstName(firstName);
      } else {
        setFirstName(tempFirstName);
        setIsFirstNameEditing(false);
      }
    } catch (error) {
      console.error("Error updating first name:", error);
      setTempFirstName(firstName);
    } finally {
      setIsUpdatingFirstName(false);
    }
  };

  const handleFirstNameCancel = () => {
    setTempFirstName(firstName); // Revert to original value
    setIsFirstNameEditing(false);
    setFirstNameUpdateError(null);
  };

  return (
    <List>
      <ListItem editing={isFirstNameEditing}>
        {isFirstNameEditing ? (
          <Form nested={true} action={handleFirstNameUpdate}>
            <Field>
              <Label>First name</Label>
              <Input
                type="text"
                name="first_name"
                placeholder="Your first name or nickname"
                required={true}
                defaultValue={firstName}
                onChange={(e) => setTempFirstName(e.target.value)}
                error={firstNameUpdateError}
              />
              {firstNameUpdateError && (
                <InputHint variant="error">{firstNameUpdateError}</InputHint>
              )}
            </Field>

            <ButtonGroup>
              <SubmitButton disabled={isUpdatingFirstName}>
                {isUpdatingFirstName ? "Updating..." : "Update"}
              </SubmitButton>
              <Button
                variant="secondary"
                onClick={handleFirstNameCancel}
                disabled={isUpdatingFirstName}
              >
                Cancel
              </Button>
            </ButtonGroup>
          </Form>
        ) : (
          <>
            <ListItemReadField>
              <Label>First name</Label>
              <p>{firstName}</p>
            </ListItemReadField>
            <Button
              variant="secondary"
              onClick={() => setIsFirstNameEditing(true)}
            >
              Edit
            </Button>
          </>
        )}
      </ListItem>

      <ListItem editing={isEmailEditing}>
        {isEmailEditing ? (
          <Form nested={true} action={handleEmailUpdate}>
            <Field>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                defaultValue={email}
                placeholder="you@example.com"
                required={true}
                error={emailUpdateError}
              />
              <InputHint>
                {emailUpdateError
                  ? emailUpdateError
                  : emailUpdateSuccess
                    ? "Done. Check your email for the verification link."
                    : "We’ll send a verification link to this email."}
              </InputHint>
            </Field>
            <ButtonGroup>
              {!emailUpdateSuccess && (
                <SubmitButton>Send the link</SubmitButton>
              )}
              <Button
                variant="secondary"
                onClick={() => setIsEmailEditing(false)}
                disabled={isUpdatingEmail}
              >
                {emailUpdateSuccess ? "Close" : "Cancel"}
              </Button>
            </ButtonGroup>
          </Form>
        ) : (
          <>
            <ListItemReadField>
              <Label>Email</Label>
              <p>{user.email}</p>
            </ListItemReadField>
            <Button variant="secondary" onClick={() => setIsEmailEditing(true)}>
              Edit
            </Button>
          </>
        )}
      </ListItem>

      <ListItem editing={isPasswordEditing}>
        <ListItemStatic>
          {isPasswordEditing ? (
            <Form nested={true} action={handlePasswordUpdate}>
              <Field>
                <Label>Password</Label>
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••••••"
                  required={true}
                  disabled={true}
                />
                <InputHint>
                  {passwordUpdateSuccess
                    ? "Done. Check your email for the password reset link."
                    : "Change your password by sending a password reset link to your email, below."}
                </InputHint>
              </Field>
              <ButtonGroup>
                {!passwordUpdateSuccess && (
                  <SubmitButton disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? "Sending..." : "Send the link"}
                  </SubmitButton>
                )}
                <Button
                  variant="secondary"
                  onClick={() => setIsPasswordEditing(false)}
                  disabled={isUpdatingPassword}
                >
                  {passwordUpdateSuccess ? "Close" : "Cancel"}
                </Button>
              </ButtonGroup>
            </Form>
          ) : (
            <>
              <ListItemReadField>
                <Label>Password</Label>
                <PasswordPreview>••••••••••••</PasswordPreview>
              </ListItemReadField>
              <Button
                variant="secondary"
                onClick={() => setIsPasswordEditing(true)}
              >
                Edit
              </Button>
            </>
          )}
        </ListItemStatic>
      </ListItem>
    </List>
  );
}

export default ProfileAccountSettings;
