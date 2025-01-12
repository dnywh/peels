import { signUpAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import SubmitButton from "@/components/SubmitButton";
// import Input from "@/components/Input";
// import Label from "@/components/Label";
import Link from "next/link";
import FieldHeader from "@/components/FieldHeader";
import Hyperlink from "@/components/Hyperlink";

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

import { styled } from "@pigment-css/react";

export default async function Signup(props: {
  searchParams: Promise<{
    error?: string;
    success?: string;
    email?: string;
    first_name?: string;
    from?: string;
  }>;
}) {
  // TODO: How are these searchParams working without special Next.js magic?
  // I could simplify my server -> client set up elsewhere if I just use this more seemingly 'native' way
  const searchParams = await props.searchParams;
  // console.log("searchParams", searchParams);

  return (
    <>
      {/* TODO: Make FormHeader action conditional based on whether this page (which should be a component) is rendered modally or as a page */}
      <FormHeader action="back">
        <h1>Sign up{searchParams.from === "listing" && " to contact hosts"}</h1>
        <p>
          Already have an account?{" "}
          <Hyperlink href="/sign-in">Sign in</Hyperlink>
        </p>
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
        <SubmitButton formAction={signUpAction} pendingText="Signing up...">
          Sign up
        </SubmitButton>
      </Form>
      {searchParams.error ||
        (searchParams.success && <FormMessage message={searchParams} />)}
    </>
  );
}
