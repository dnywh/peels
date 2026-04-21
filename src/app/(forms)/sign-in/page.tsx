import { siteConfig } from "@/config/site";
import FormHeader from "@/components/FormHeader";
import StrongLink from "@/components/StrongLink";
import SignInForm from "@/components/SignInForm";
import FormFooter from "@/components/FormFooter";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.signIn");

  return {
    title: t("title"),
    openGraph: {
      title: `${t("title")} · ${siteConfig.name}`,
    },
  };
}

export default async function SignIn(props: {
  searchParams: Promise<{
    redirect_to?: string;
    error?: string;
    success?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const t = await getTranslations("Auth.signIn");

  return (
    <>
      {/* TODO: Make FormHeader action conditional based on whether this page (which should be a component) is rendered modally or as a page */}
      <FormHeader button="back">
        <h1>{t("title")}</h1>
      </FormHeader>

      <SignInForm searchParams={searchParams} />

      <FormFooter>
        <p>
          {t.rich("firstTime", {
            link: (chunks) => <StrongLink href="/sign-up">{chunks}</StrongLink>,
          })}
        </p>
      </FormFooter>
    </>
  );
}
