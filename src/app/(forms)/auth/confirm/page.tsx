import Form from "@/components/Form";
import FormHeader from "@/components/FormHeader";
import SubmitButton from "@/components/SubmitButton";
import {
  getDefaultNextPathByType,
  getLocaleFromSearchParams,
  isSupportedEmailAuthType,
  normaliseNextPath,
} from "@/utils/authRedirects";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { confirmEmailAuthAction } from "./actions";
import { getInvalidLinkRedirectPath } from "./redirects";

type ConfirmSearchParams = Record<string, string | string[] | undefined>;

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const confirmationCopyByType = {
  email: "signUp",
  email_change: "emailChange",
  invite: "invite",
  magiclink: "signIn",
  recovery: "recovery",
  signup: "signUp",
} as const;

export default async function ConfirmEmailAuthPage({
  searchParams,
}: {
  searchParams: Promise<ConfirmSearchParams>;
}) {
  const params = await searchParams;
  const authType = firstValue(params.type) ?? null;
  const tokenHash = firstValue(params.token_hash) ?? firstValue(params.token);
  const requestedNextPath =
    firstValue(params.next) ?? firstValue(params.redirect_to);
  const nextPath = normaliseNextPath(
    requestedNextPath,
    getDefaultNextPathByType(authType)
  );

  if (!tokenHash || !isSupportedEmailAuthType(authType)) {
    redirect(getInvalidLinkRedirectPath(nextPath));
  }

  const locale = getLocaleFromSearchParams(params);
  const email = firstValue(params.email);
  const confirmationCopy = confirmationCopyByType[authType];
  const t = await getTranslations();

  return (
    <>
      <FormHeader button="none">
        <h1>{t(`Auth.confirm.${confirmationCopy}.title`)}</h1>
        <p>{t(`Auth.confirm.${confirmationCopy}.body`)}</p>
      </FormHeader>
      <Form action={confirmEmailAuthAction}>
        <input type="hidden" name="token_hash" value={tokenHash} />
        <input type="hidden" name="type" value={authType} />
        <input type="hidden" name="next" value={nextPath} />
        {locale && <input type="hidden" name="locale" value={locale} />}
        {email && <input type="hidden" name="email" value={email} />}
        <SubmitButton
          fullWidth
          pendingText={t("Auth.confirm.pendingAction")}
          data-testid="auth-confirm-submit"
        >
          {t("Actions.continue")}
        </SubmitButton>
      </Form>
    </>
  );
}
