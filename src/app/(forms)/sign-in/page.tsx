import { signInAction } from "@/app/actions";
import SubmitButton from "@/components/SubmitButton";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Form from "@/components/Form";
import FormHeader from "@/components/FormHeader";
import Field from "@/components/Field";
import FieldHeader from "@/components/FieldHeader";
import Hyperlink from "@/components/Hyperlink";
import FormMessage from "@/components/FormMessage";

import FormFooter from "@/components/FormFooter";

export default async function SignIn(props: {
  searchParams: Promise<{
    redirect_to?: string;
    error?: string;
    success?: string;
  }>;
}) {
  const searchParams = await props.searchParams;

  return (
    <>
      {/* TODO: Make FormHeader action conditional based on whether this page (which should be a component) is rendered modally or as a page */}
      <FormHeader button="back">
        <h1>Sign in to Peels</h1>
      </FormHeader>

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
      <FormFooter>
        <p>
          First time here? <Hyperlink href="/sign-up">Sign up</Hyperlink>
        </p>
      </FormFooter>
    </>
  );
}
