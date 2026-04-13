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
import { getTranslations } from "next-intl/server";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  const t = await getTranslations();
  const headersList = await headers();
  const referer = headersList.get("referer") || "";
  const isFromProfile = referer.includes("/profile");

  if (searchParams.success) {
    return (
      <>
        <FormHeader button="none">
          <h1>{t("Auth.resetPassword.successTitle")}</h1>
        </FormHeader>
        <Form as="container">
          <p>{searchParams.success}</p>
          {/* User is authenticated at this point so we can redirect them to a protected route */}
          <Button href="/profile" variant="primary">
            {t("Actions.backToPeels")}
          </Button>
        </Form>
      </>
    );
  }

  return (
    <>
      <FormHeader button={isFromProfile ? "back" : "none"}>
        <h1>{t("Auth.resetPassword.title")}</h1>
        <p>{t("Auth.resetPassword.body")}</p>
      </FormHeader>
      <Form>
        <Field>
          <Label htmlFor="password">
            {t("Auth.resetPassword.newPassword")}
          </Label>
          <Input
            type="password"
            name="password"
            placeholder={t("Auth.resetPassword.newPassword")}
            minLength={FIELD_CONFIGS.password.minLength}
            required={true}
          />
        </Field>
        <Field>
          <Label htmlFor="confirmPassword">
            {t("Auth.resetPassword.confirmPassword")}
          </Label>
          <Input
            type="password"
            name="confirmPassword"
            placeholder={t("Auth.resetPassword.confirmPassword")}
            minLength={FIELD_CONFIGS.password.minLength}
            required={true}
          />
        </Field>

        {searchParams.error && (
          <FormMessage message={{ error: searchParams.error }} />
        )}
        <SubmitButton
          formAction={resetPasswordAction}
          pendingText={t("Status.resetting")}
        >
          {t("Actions.resetPassword")}
        </SubmitButton>
      </Form>
    </>
  );
}
