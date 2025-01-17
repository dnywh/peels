import { signUpAction } from "@/app/actions";

// import Input from "@/components/Input";
// import Label from "@/components/Label";
import Link from "next/link";

import { redirect } from "next/navigation";

import {
  // Field,
  Fieldset,
  // Input,
  Label,
  Legend,
  Select,
  Textarea,
} from "@headlessui/react";

import FormHeader from "@/components/FormHeader";
import Form from "@/components/Form";
import Field from "@/components/Field";
import Input from "@/components/Input";
import FormFooter from "@/components/FormFooter";
import FormMessage from "@/components/FormMessage";
import SubmitButton from "@/components/SubmitButton";
import FieldHeader from "@/components/FieldHeader";
import Hyperlink from "@/components/Hyperlink";
import EncodedEmailHyperlink from "@/components/EncodedEmailHyperlink";

export default async function SignUp(props: {
  searchParams: Promise<{
    error?: string;
    success?: boolean;
    email?: string;
    first_name?: string;
    from?: string;
  }>;
}) {
  // TODO: How are these searchParams working without special Next.js magic?
  // I could simplify my server -> client set up elsewhere if I just use this more seemingly 'native' way
  const searchParams = await props.searchParams;

  // Handle success state
  if (searchParams.success) {
    return (
      <>
        <FormHeader button="none">
          <h1>Check your email</h1>
        </FormHeader>
        <Form as="container">
          <>
            <p>
              Thanks for signing up
              {searchParams.first_name && `, ${searchParams.first_name}`}!
              Please check your email for a verification link.
            </p>
          </>
        </Form>
        <FormFooter>
          <p>
            Never received the email?{" "}
            {/* TODO: Resend verification email to {searchParams.email}. */}
            <EncodedEmailHyperlink address="c3VwcG9ydEBwZWVscy5hcHA=">
              Let us know
            </EncodedEmailHyperlink>
            .
          </p>
        </FormFooter>
      </>
    );
  }

  return (
    <>
      {/* TODO: Make FormHeader action conditional based on whether this page (which should be a component) is rendered modally or as a page */}
      <FormHeader button="back">
        <h1>
          Sign up to{" "}
          {searchParams.from === "listing"
            ? "contact hosts"
            : "start composting"}
        </h1>
      </FormHeader>
      <Form>
        <Field>
          <Label htmlFor="first_name">First name</Label>
          <Input
            name="first_name"
            placeholder="Your first name"
            required
            defaultValue={searchParams.first_name}
          />
        </Field>
        <Field>
          <Label htmlFor="email">Email</Label>
          <Input
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            defaultValue={searchParams.email}
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
        <Field>
          <FieldHeader>
            <Label htmlFor="invite_code">Invite code</Label>
            <Hyperlink href="/preview">Need one?</Hyperlink>
          </FieldHeader>
          <Input name="invite_code" placeholder="Your invite code" required />
        </Field>

        {searchParams.error && (
          <FormMessage message={{ error: searchParams.error }} />
        )}
        <SubmitButton formAction={signUpAction} pendingText="Signing up...">
          Sign up
        </SubmitButton>
      </Form>
      <FormFooter>
        <p>
          Already have an account?{" "}
          <Hyperlink href="/sign-in">Sign in</Hyperlink>
        </p>
      </FormFooter>
    </>
  );
}
