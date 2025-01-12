import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
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
  return (
    <Form>
      <h1>Forgot password</h1>
      <p>
        Already have an account? <Link href="/sign-in">Sign in</Link>
      </p>

      <Field>
        <Label htmlFor="email">Email</Label>
        <Input name="email" placeholder="you@example.com" required />
      </Field>
      <SubmitButton formAction={forgotPasswordAction}>
        Reset Password
      </SubmitButton>
      <FormMessage message={searchParams} />
    </Form>
  );
}
