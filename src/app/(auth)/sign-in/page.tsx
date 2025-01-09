import { signInAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import SubmitButton from "@/components/SubmitButton";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Form from "@/components/Form";
import Field from "@/components/Field";

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
    <Form>
      <h1>Sign in</h1>
      <p>
        Don't have an account?{" "}
        <Link className="text-foreground font-medium underline" href="/sign-up">
          Sign up
        </Link>
      </p>

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
        <Label htmlFor="password">Password</Label>
        <Link
          className="text-xs text-foreground underline"
          href="/forgot-password"
        >
          Forgot Password?
        </Link>

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
  );
}
