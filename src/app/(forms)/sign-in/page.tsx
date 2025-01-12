import { signInAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import SubmitButton from "@/components/SubmitButton";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Form from "@/components/Form";
import FormHeader from "@/components/FormHeader";
import Field from "@/components/Field";
import FieldHeader from "@/components/FieldHeader";
import Hyperlink from "@/components/Hyperlink";

import Link from "next/link";

export default async function Login(props: {
  searchParams: Promise<{
    next?: string;
    error?: string;
    success?: string;
  }>;
}) {
  const searchParams = await props.searchParams;

  return (
    <>
      {/* TODO: Make FormHeader action conditional based on whether this page (which should be a component) is rendered modally or as a page */}
      <FormHeader action="back">
        <h1>Sign in</h1>
        <p>
          Don't have an account? <Hyperlink href="/sign-up">Sign up</Hyperlink>
        </p>
      </FormHeader>

      <Form>
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
            <Hyperlink href="/forgot-password">Forgot Password?</Hyperlink>
          </FieldHeader>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            required
          />
        </Field>

        {searchParams.next && (
          <input type="hidden" name="next" value={searchParams.next} />
        )}
        <SubmitButton pendingText="Signing In..." formAction={signInAction}>
          Sign in
        </SubmitButton>

        <FormMessage
          message={{ error: searchParams.error, success: searchParams.success }}
        />
      </Form>
    </>
  );
}
