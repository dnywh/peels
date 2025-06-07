import { siteConfig } from "@/config/site";
import FormHeader from "@/components/FormHeader";
import StrongLink from "@/components/StrongLink";
import SignInForm from "@/components/SignInForm";
import FormFooter from "@/components/FormFooter";

export const metadata = {
  title: "Sign In",
  openGraph: {
    title: `Sign In · ${siteConfig.name}`,
  },
};

export default async function SignIn(props: {
  searchParams: Promise<{
    redirect_to?: string;
    error?: string;
    success?: string;
  }>;
}) {
  const searchParams = await props.searchParams;

  return (
    <>
      {/* TODO: Make FormHeader action conditional based on whether this page (which should be a component) is rendered modally or as a page */}
      <FormHeader button="back">
        <h1>Sign in to Peels</h1>
      </FormHeader>

      <SignInForm searchParams={searchParams} />

      <FormFooter>
        <p>
          First time here? <StrongLink href="/sign-up">Sign up</StrongLink>
        </p>
      </FormFooter>
    </>
  );
}
