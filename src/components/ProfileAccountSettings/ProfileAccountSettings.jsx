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
  gap: `calc(${theme.spacing.unit} * 2)`,
}));

const ListItem = styled("li")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: theme.spacing.unit,

  variants: [
    {
      props: { editing: true },
      style: {
        flexDirection: "column",

        "&:not(:last-child)": {
          paddingBottom: "1rem",
          borderBottom: `1px solid ${theme.colors.border.base}`,
        },
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
          <Form>
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
          <Form>
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
        {isPasswordEditing ? (
          <Form>
            <Field>
              <Label>Password</Label>
              <Input
                type="password"
                name="password"
                value="************"
                disabled={true}
              />
              <InputHint>
                Your password can only be changed via email.
              </InputHint>
              <p>
                Tap the button below to send a password reset link to{" "}
                {user.email}.
              </p>
            </Field>

            <ButtonGroup>
              <SubmitButton>Email me the link</SubmitButton>
              <Button
                variant="secondary"
                onClick={() => setIsPasswordEditing(false)}
              >
                Cancel
              </Button>
            </ButtonGroup>
          </Form>
        ) : (
          <>
            <ListItemReadField>
              <Label>Password</Label>
              <p>************</p>
            </ListItemReadField>
            <Button
              variant="secondary"
              onClick={() => setIsPasswordEditing(true)}
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
