"use client";
import { useState } from "react";
import Button from "@/components/Button";
import Form from "@/components/Form";
import Field from "@/components/Field";
import Label from "@/components/Label";
import Input from "@/components/Input";
import SubmitButton from "@/components/SubmitButton";
import InputHint from "@/components/InputHint";

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

const ListItemText = styled("div")(({ theme }) => ({
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
  const [email, setEmail] = useState(user.email);

  return (
    <List>
      <ListItem editing={isEmailEditing}>
        {isEmailEditing ? (
          <Form nested={true}>
            <Field>
              <Label>Email</Label>
              <Input type="email" name="email" defaultValue={email} />
            </Field>
            <ButtonGroup>
              <SubmitButton>Update</SubmitButton>
              <Button
                variant="secondary"
                onClick={() => setIsEmailEditing(false)}
              >
                Cancel
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

      <ListItem editing={isFirstNameEditing}>
        {isFirstNameEditing ? (
          <Form nested={true}>
            <Field>
              <Label>First name</Label>
              <Input
                type="text"
                name="first_name"
                placeholder="Your first name or nickname"
                defaultValue={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Field>

            <ButtonGroup>
              <SubmitButton>Update</SubmitButton>
              <Button
                variant="secondary"
                onClick={() => setIsFirstNameEditing(false)}
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

      <ListItem editing={isPasswordEditing}>
        <ListItemStatic>
          <ListItemReadField>
            <Label>Password</Label>
            <PasswordPreview>••••••••••••</PasswordPreview>
          </ListItemReadField>

          {!isPasswordEditing && (
            <Button
              variant="secondary"
              onClick={() => setIsPasswordEditing(true)}
            >
              Edit
            </Button>
          )}
        </ListItemStatic>

        {isPasswordEditing && (
          <Form nested={true}>
            <p>
              Tap the button below to send a password reset link to {user.email}
              .
            </p>
            <ButtonGroup>
              <SubmitButton>Send the link</SubmitButton>
              <Button
                variant="secondary"
                onClick={() => setIsPasswordEditing(false)}
              >
                Cancel
              </Button>
            </ButtonGroup>
          </Form>
        )}
      </ListItem>
    </List>
  );
}

export default ProfileAccountSettings;
