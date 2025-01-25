import { resetPasswordAction } from "@/app/actions";
import { FIELD_CONFIGS } from "@/lib/formValidation";
import { headers } from "next/headers";

import FormMessage, { Message } from "@/components/FormMessage";
import FormHeader from "@/components/FormHeader";
import Button from "@/components/Button";
import SubmitButton from "@/components/SubmitButton";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Form from "@/components/Form";
import Field from "@/components/Field";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  const headersList = await headers();
  const referer = headersList.get("referer") || "";
  const isFromProfile = referer.includes("/profile");

  if (searchParams.success) {
    return (
      <>
        <FormHeader button="none">
          <h1>Password updated</h1>
        </FormHeader>
        <Form as="container">
          <p>{searchParams.success}</p>
          {/* User is authenticated at this point so we can redirect them to a protected route */}
          <Button href="/profile" variant="primary">
            Back to Peels
          </Button>
        </Form>
      </>
    );
  }

  return (
    <>
      <FormHeader button={isFromProfile ? "back" : "none"}>
        <h1>Reset password</h1>
        <p>Please enter your new password below.</p>
      </FormHeader>
      <Form>
        <Field>
          <Label htmlFor="password">New password</Label>
          <Input
            type="password"
            name="password"
            placeholder="New password"
            minLength={FIELD_CONFIGS.password.minLength}
            required={true}
          />
        </Field>
        <Field>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            minLength={FIELD_CONFIGS.password.minLength}
            required={true}
          />
        </Field>

        {searchParams.error && (
          <FormMessage message={{ error: searchParams.error }} />
        )}
        <SubmitButton formAction={resetPasswordAction}>
          Reset password
        </SubmitButton>
      </Form>
    </>
  );
}
