import { forgotPasswordAction } from "@/app/actions";

import FormHeader from "@/components/FormHeader";
import FormMessage, { Message } from "@/components/FormMessage";
import SubmitButton from "@/components/SubmitButton";
import Form from "@/components/Form";
import Field from "@/components/Field";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  const t = await getTranslations();

  if (searchParams.success) {
    return (
      <>
        <FormHeader button="none">
          <h1>{t("Auth.forgotPassword.sentTitle")}</h1>
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
        <h1>{t("Auth.forgotPassword.title")}</h1>
        <p>{t("Auth.forgotPassword.body")}</p>
      </FormHeader>
      <Form>
        <Field>
          <Label htmlFor="email">{t("Common.email")}</Label>
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
        <SubmitButton
          formAction={forgotPasswordAction}
          pendingText={t("Status.emailing")}
        >
          {t("Actions.emailLink")}
        </SubmitButton>
      </Form>
    </>
  );
}
