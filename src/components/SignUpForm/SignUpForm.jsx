"use client";
import { signUpAction } from "@/app/actions";
import Button from "@/components/Button";
import CheckboxCluster from "@/components/CheckboxCluster";
import CheckboxRow from "@/components/CheckboxRow";
import EncodedEmailLink from "@/components/EncodedEmailLink";
import Field from "@/components/Field";
import Form from "@/components/Form";
import FormMessage from "@/components/FormMessage";
import Input from "@/components/Input";
import InputHint from "@/components/InputHint";
import Label from "@/components/Label";
import LegalAgreement from "@/components/LegalAgreement";
import { siteConfig } from "@/config/site";
import { FIELD_CONFIGS, validateName } from "@/lib/formValidation";
import { getStoredAttributionParams } from "@/utils/attributionUtils";
import { isTurnstileEnabled } from "@/utils/utils";
import { Turnstile } from "@marsidev/react-turnstile";
import { useState } from "react";

export default function SignUpForm({ defaultValues = {}, error }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstNameError, setFirstNameError] = useState(null);
  const [captchaToken, setCaptchaToken] = useState();
  const [captchaError, setCaptchaError] = useState(null);

  // Helper to determine if there are any field-level errors
  const hasFieldErrors = Boolean(firstNameError || captchaError);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      // Add captcha token to form data if available
      if (captchaToken) {
        formData.append("captcha_token", captchaToken);
      }

      // Add stored UTM parameters to form data
      const utmParams = getStoredAttributionParams();
      Object.entries(utmParams).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      // Reset validation errors
      setFirstNameError(null);
      setCaptchaError(null);

      // Client-side validation
      const validation = validateName(formData.get("first_name"));
      if (!validation.isValid) {
        setFirstNameError(validation.error);
        setIsSubmitting(false);
        console.log("Validation failed, resetting submit state");
        return;
      }

      // Validate CAPTCHA token is present (only if Turnstile is enabled)
      if (isTurnstileEnabled() && !captchaToken) {
        setCaptchaError("Please complete the verification challenge.");
        setIsSubmitting(false);
        return;
      }

      await signUpAction(formData);
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

      <CheckboxCluster>
        <LegalAgreement required={true} />
        <CheckboxRow
          name="newsletter_preference" // Checked in server action, ignored in formData if left unchecked
          required={false}
          defaultChecked={defaultValues.newsletter_preference}
        >
          Send me occasional email updates about Peels
        </CheckboxRow>
      </CheckboxCluster>

      {(error || hasFieldErrors) && (
        <FormMessage
          message={{
            error: error ? (
              <>
                {error?.endsWith(".") ? error : `${error}.`} If you think this
                might be wrong, please{" "}
                <EncodedEmailLink address={siteConfig.encodedEmail.support}>
                  email us
                </EncodedEmailLink>
                .
              </>
            ) : hasFieldErrors ? (
              "Please fix the above error and then try again."
            ) : (
              "Hmm, something went wrong. Please try again."
            ),
          }}
        />
      )}

      {isTurnstileEnabled() && (
        <div style={{ borderRadius: "1rem", overflow: "hidden" }}>
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY}
            options={{
              theme: "light",
              size: "flexible",
            }}
            onSuccess={(token) => {
              setCaptchaToken(token);
              setCaptchaError(null);
            }}
            onError={() => {
              setCaptchaToken(null);
              setCaptchaError("Verification failed. Please try again.");
            }}
            onExpire={() => {
              setCaptchaToken(null);
              setCaptchaError(
                "Verification expired. Please complete it again."
              );
            }}
          />
          {captchaError && (
            <InputHint variant="error">{captchaError}</InputHint>
          )}
        </div>
      )}
      <Button
        type="submit"
        variant="primary"
        loading={isSubmitting}
        loadingText="Signing up..."
        disabled={(isTurnstileEnabled() && !captchaToken) || isSubmitting}
      >
        Sign up
      </Button>
    </Form>
  );
}
