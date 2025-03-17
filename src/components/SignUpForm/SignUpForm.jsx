"use client";
import { useState, useEffect } from "react";

import { signUpAction } from "@/app/actions";
import { validateFirstName, FIELD_CONFIGS } from "@/lib/formValidation";
import {
  getStoredAttributionParams,
  clearAttributionParams,
} from "@/utils/attribution";

import Form from "@/components/Form";
import Field from "@/components/Field";
import Input from "@/components/Input";
import Label from "@/components/Label";
import InputHint from "@/components/InputHint";
import Button from "@/components/Button";
import LegalAgreement from "@/components/LegalAgreement";
import FormMessage from "@/components/FormMessage";

export default function SignUpForm({ defaultValues = {}, error }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstNameError, setFirstNameError] = useState(null);

  // Helper to determine if there are any field-level errors
  const hasFieldErrors = Boolean(firstNameError);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);

      // Add stored UTM parameters to form data
      const utmParams = getStoredAttributionParams();
      Object.entries(utmParams).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      // Reset validation errors
      setFirstNameError(null);

      // Client-side validation
      const validation = validateFirstName(formData.get("first_name"));
      if (!validation.isValid) {
        setFirstNameError(validation.error);
        setIsSubmitting(false);
        console.log("Validation failed, resetting submit state");
        return;
      }

      console.log("Submitting sign up data with attribution:", utmParams);
      await signUpAction(formData);

      // Clear stored attribution params after successful signup
      clearAttributionParams();

      // Note: We might not reach this point if signUpAction redirects
      console.log("Sign up completed");
    } catch (error) {
      console.error("Sign up error:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
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
      <Button
        type="submit"
        variant="primary"
        loading={isSubmitting}
        loadingText="Signing up..."
      >
        Sign up
      </Button>
    </Form>
  );
}
