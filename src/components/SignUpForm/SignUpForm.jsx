"use client";
import { useState } from "react";

import { validateFirstName, FIELD_CONFIGS } from "@/lib/formValidation";

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

  // Helper to determine if there are any field-level errors
  const hasFieldErrors = Boolean(firstNameError);

  const handleSubmit = async (formData) => {
    setFirstNameError(null);

    const validation = validateFirstName(formData.get("first_name"));
    if (!validation.isValid) {
      setFirstNameError(validation.error);
      return false;
    }

    return signUpAction(formData);
  };

  return (
    <Form action={handleSubmit}>
      <Field>
        <Label htmlFor="first_name">First name</Label>
        <Input
          name="first_name"
          {...FIELD_CONFIGS.firstName}
          defaultValue={defaultValues.first_name}
          error={firstNameError}
        />
        {firstNameError && (
          <InputHint variant="error">{firstNameError}</InputHint>
        )}
      </Field>

      <Field>
        <Label htmlFor="email">Email</Label>
        <Input
          name="email"
          {...FIELD_CONFIGS.email}
          defaultValue={defaultValues.email}
        />
      </Field>

      <Field>
        <Label htmlFor="password">Password</Label>
        <Input
          name="password"
          {...FIELD_CONFIGS.password}
          placeholder="Your new password" // Overwrites the placeholder in FIELD_CONFIGS.password
        />
      </Field>
      {/* 
      <Field>
        <Label htmlFor="invite_code">Invite code</Label>
        <Input
          name="invite_code"
          placeholder="Your invite code"
          required={true}
        />
      </Field> */}

      <LegalAgreement required={true} defaultChecked={false} disabled={false} />

      {(error || hasFieldErrors) && (
        <FormMessage
          message={{
            error:
              error ||
              (hasFieldErrors
                ? "Please fix the above error and then try again."
                : "Hmm, something went wrong. Please try again."),
          }}
        />
      )}
      <SubmitButton pendingText="Signing up...">Sign up</SubmitButton>
    </Form>
  );
}
