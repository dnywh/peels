"use client";

import { useState } from "react";
import { signInAction } from "@/app/actions";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Form from "@/components/Form";
import Field from "@/components/Field";
import FieldHeader from "@/components/FieldHeader";
import StrongLink from "@/components/StrongLink";
import FormMessage from "@/components/FormMessage";
import { useTranslations } from "next-intl";

function SignInForm({ searchParams }) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Create FormData from the form
      const formData = new FormData(event.currentTarget);

      // Add redirect_to if it exists in searchParams
      if (searchParams?.redirect_to) {
        formData.append("redirect_to", searchParams.redirect_to);
      }

      console.log("Submitting sign in data");
      await signInAction(formData);
      // Don't reset isSubmitting on success - let the redirect handle cleanup
    } catch (error) {
      console.error("Sign in error:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} data-testid="sign-in-form">
      {searchParams?.success && (
        <FormMessage message={{ success: searchParams.success }} />
      )}
      <Field>
        <Label htmlFor="email">{t("Common.email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </Field>

      <Field>
        <FieldHeader>
          <Label htmlFor="password">{t("Common.password")}</Label>
          <StrongLink href="/forgot-password">
            {t("Auth.signIn.forgotPassword")}
          </StrongLink>
        </FieldHeader>
        <Input
          id="password"
          type="password"
          name="password"
          placeholder={t("Common.password")}
          required={true}
        />
      </Field>

      {searchParams?.error && (
        <FormMessage message={{ error: searchParams.error }} />
      )}

      <Button
        type="submit"
        variant="primary"
        loading={isSubmitting}
        loadingText={t("Status.signingIn")}
        data-testid="sign-in-submit"
      >
        {t("Actions.signIn")}
      </Button>
    </Form>
  );
}

export default SignInForm;
