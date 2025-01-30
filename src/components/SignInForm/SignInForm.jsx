"use client";
import { useState } from "react";

import { signInAction } from "@/app/actions";

import SubmitButton from "@/components/SubmitButton";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Form from "@/components/Form";
import Field from "@/components/Field";
import FieldHeader from "@/components/FieldHeader";
import Hyperlink from "@/components/Hyperlink";
import FormMessage from "@/components/FormMessage";

function SignInForm({ searchParams }) {
  return (
    <Form>
      {searchParams.success && (
        <FormMessage message={{ success: searchParams.success }} />
      )}
      <Field>
        <Label htmlFor="email">Email</Label>
        <Input
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </Field>

      <Field>
        <FieldHeader>
          <Label htmlFor="password">Password</Label>
          <Hyperlink href="/forgot-password">Forgot password?</Hyperlink>
        </FieldHeader>
        <Input
          type="password"
          name="password"
          placeholder="Your password" // Overwrites the placeholder in FIELD_CONFIGS.password (if that were to be imported above)
          required={true}
        />
      </Field>

      {searchParams.redirect_to && (
        <input
          type="hidden"
          name="redirect_to"
          value={searchParams.redirect_to}
        />
      )}

      {searchParams.error && (
        <FormMessage message={{ error: searchParams.error }} />
      )}

      <SubmitButton pendingText="Signing in..." formAction={signInAction}>
        Sign in
      </SubmitButton>
    </Form>
  );
}

export default SignInForm;
