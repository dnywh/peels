import { forgotPasswordAction } from "@/app/actions";

import FormHeader from "@/components/FormHeader";
import FormMessage, { Message } from "@/components/FormMessage";
import SubmitButton from "@/components/SubmitButton";
import Form from "@/components/Form";
import Field from "@/components/Field";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Link from "next/link";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  if (searchParams.success) {
    return (
      <>
        <FormHeader button="none">
          <h1>Email sent</h1>
        </FormHeader>
        <Form as="container">
          {/* TODO: include address that was emailed, so user can notice any typos */}
          <p>{searchParams.success}</p>
        </Form>
      </>
    );
  }
  return (
    <>
      <FormHeader button="back">
        <h1>Forgot password</h1>
        <p>
          It happens to all of us. Enter your email below to receive a password
          reset link.
        </p>
      </FormHeader>
      <Form>
        <Field>
          <Label htmlFor="email">Email</Label>
          <Input
            name="email"
            type="email"
            placeholder="you@example.com"
            required={true}
          />
        </Field>

        {searchParams.error && (
          <FormMessage message={{ error: searchParams.error }} />
        )}
        <SubmitButton formAction={forgotPasswordAction}>
          Email me the link
        </SubmitButton>
      </Form>
    </>
  );
}
