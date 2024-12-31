import { signUpAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import Link from "next/link";

import {
  // Field,
  Fieldset,
  // Input,
  Label,
  Legend,
  Select,
  Textarea,
} from "@headlessui/react";

import Field from "@/components/Field";
import Input from "@/components/Input";

import { styled } from "@pigment-css/react";

const Form = styled("form")({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  width: "100%",
  maxWidth: "40rem",
});

const Header = styled("header")({
  textAlign: "center",
});

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
      <Header>
        <h1>Sign up{searchParams.from === "listing" && " to contact hosts"}</h1>
        <p>
          Already have an account? <Link href="/sign-in">Sign in</Link>
        </p>
      </Header>
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
            type="email"
            name="email"
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
          <Label htmlFor="invite_code">Invite code</Label>
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
