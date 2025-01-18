"use client";
import { useState } from "react";
import Form from "@/components/Form";
import Field from "@/components/Field";
import Input from "@/components/Input";
import Label from "@/components/Label";
import InputHint from "@/components/InputHint";
import SubmitButton from "@/components/SubmitButton";
import LegalAgreement from "@/components/LegalAgreement";
import FormMessage from "@/components/FormMessage";
import { signUpAction } from "@/app/actions";

export default function SignUpForm({ defaultValues = {}, error }) {
  const [firstNameError, setFirstNameError] = useState(null);

  const handleSubmit = async (formData) => {
    // Clear any previous errors
    setFirstNameError(null);

    const firstName = formData.get("first_name")?.toString().trim();

    // Validate first name
    if (!firstName) {
      setFirstNameError("You can't have an empty first name.");
      return false; // Prevent form submission
    }

    // If validation passes, proceed with the server action
    return signUpAction(formData);
  };

  return (
    <Form action={handleSubmit}>
      <Field>
        <Label htmlFor="first_name">First name</Label>
        <Input
          name="first_name"
          placeholder="Your first name or nickname"
          required={true}
          defaultValue={defaultValues.first_name}
          error={firstNameError}
        />
        {firstNameError ? (
          <InputHint variant="error">{firstNameError}</InputHint>
        ) : (
          <InputHint>Or a pseudonym, if you prefer!</InputHint>
        )}
      </Field>

      <Field>
        <Label htmlFor="email">Email</Label>
        <Input
          name="email"
          type="email"
          placeholder="you@example.com"
          required={true}
          defaultValue={defaultValues.email}
        />
      </Field>
      <Field>
        <Label htmlFor="password">Password</Label>
        <Input
          type="password"
          name="password"
          placeholder="Your password"
          minLength={6}
          required
        />
      </Field>

      <LegalAgreement required={true} />

      {error && <FormMessage message={{ error }} />}
      <SubmitButton pendingText="Signing up...">Sign up</SubmitButton>
    </Form>
  );
}
