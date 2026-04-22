import { signInAction } from "@/app/actions";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Form from "@/components/Form";
import Field from "@/components/Field";
import FieldHeader from "@/components/FieldHeader";
import StrongLink from "@/components/StrongLink";
import FormMessage from "@/components/FormMessage";
import SubmitButton from "@/components/SubmitButton";
import { getTranslations } from "next-intl/server";

type SignInFormProps = {
  searchParams?: {
    redirect_to?: string;
    error?: string;
    success?: string;
  };
};

async function SignInForm({ searchParams }: SignInFormProps) {
  const t = await getTranslations();

  return (
    <Form action={signInAction} data-testid="sign-in-form">
      {searchParams?.success && (
        <FormMessage message={{ success: searchParams.success }} />
      )}

      {searchParams?.redirect_to && (
        <input
          type="hidden"
          name="redirect_to"
          value={searchParams.redirect_to}
        />
      )}

      <Field>
        <Label htmlFor="email">{t("Common.email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          data-testid="sign-in-email"
        />
      </Field>

      <Field>
        <FieldHeader>
          <Label htmlFor="password">{t("Common.password")}</Label>
          <StrongLink href="/forgot-password">
            {t("Auth.signIn.forgotPassword")}
          </StrongLink>
        </FieldHeader>
        <Input
          id="password"
          type="password"
          name="password"
          placeholder={t("Common.password")}
          required={true}
          data-testid="sign-in-password"
        />
      </Field>

      {searchParams?.error && (
        <FormMessage message={{ error: searchParams.error }} />
      )}

      <SubmitButton
        variant="primary"
        pendingText={t("Status.signingIn")}
        data-testid="sign-in-submit"
      >
        {t("Actions.signIn")}
      </SubmitButton>
    </Form>
  );
}

export default SignInForm;
