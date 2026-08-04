import Button from "@/components/Button";
import Field from "@/components/Field";
import Form from "@/components/Form";
import FormHeader from "@/components/FormHeader";
import FormMessage from "@/components/FormMessage";
import Input from "@/components/Input";
import Label from "@/components/Label";
import SubmitButton from "@/components/SubmitButton";
import {
  getLocaleFromSearchParams,
  normaliseNextPath,
} from "@/utils/authRedirects";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { retryEmailAuthAction } from "./actions";

type RetryType = "email_change" | "invite" | "magiclink" | "signup";
type RetrySearchParams = Record<string, string | string[] | undefined>;

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const isRetryType = (value: string | undefined): value is RetryType =>
  value === "email_change" ||
  value === "invite" ||
  value === "magiclink" ||
  value === "signup";

export default async function RetryEmailAuthPage({
  searchParams,
}: {
  searchParams: Promise<RetrySearchParams>;
}) {
  const params = await searchParams;
  const requestedType = firstValue(params.type);
  if (!isRetryType(requestedType)) redirect("/sign-in");

  const type = requestedType;
  const nextPath = normaliseNextPath(firstValue(params.next), "/profile");
  const locale = getLocaleFromSearchParams(params);
  const error = firstValue(params.error);
  const success = firstValue(params.success);
  const t = await getTranslations();

  if (type === "invite") {
    return (
      <>
        <FormHeader button="none">
          <h1>{t("Auth.retry.invite.title")}</h1>
          <p>{t("Auth.retry.invite.body")}</p>
        </FormHeader>
        <Form as="container">
          <Button href="/sign-in" variant="primary" width="full">
            {t("Actions.signIn")}
          </Button>
        </Form>
      </>
    );
  }

  if (type === "email_change") {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const profilePath = `/profile?${new URLSearchParams({
      error: error ?? t("Errors.emailChangeLinkInvalid"),
    })}`;

    return (
      <>
        <FormHeader button="none">
          <h1>{t("Auth.retry.emailChange.title")}</h1>
          <p>{t("Auth.retry.emailChange.body")}</p>
        </FormHeader>
        <Form as="container">
          <Button
            href={
              user
                ? profilePath
                : `/sign-in?${new URLSearchParams({ redirect_to: profilePath })}`
            }
            variant="primary"
            width="full"
          >
            {user ? t("Auth.retry.emailChange.action") : t("Actions.signIn")}
          </Button>
        </Form>
      </>
    );
  }

  return (
    <>
      <FormHeader button="none">
        <h1>{t(`Auth.retry.${type}.title`)}</h1>
        <p>{t(`Auth.retry.${type}.body`)}</p>
      </FormHeader>
      <Form action={retryEmailAuthAction}>
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="next" value={nextPath} />
        {locale && <input type="hidden" name="locale" value={locale} />}
        <Field>
          <Label htmlFor="email">{t("Common.email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </Field>
        {(error || success) && (
          <FormMessage message={success ? { success } : { error }} />
        )}
        <SubmitButton
          pendingText={t("Status.emailing")}
          width="full"
          data-testid="auth-retry-submit"
        >
          {t("Actions.emailLink")}
        </SubmitButton>
      </Form>
    </>
  );
}
