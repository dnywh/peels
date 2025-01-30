import { signInAction } from "@/app/actions";
import SubmitButton from "@/components/SubmitButton";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Form from "@/components/Form";
import FormHeader from "@/components/FormHeader";
import Field from "@/components/Field";
import FieldHeader from "@/components/FieldHeader";
import Hyperlink from "@/components/Hyperlink";
import FormMessage from "@/components/FormMessage";

import SignInForm from "@/components/SignInForm";
import FormFooter from "@/components/FormFooter";

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
          First time here? <Hyperlink href="/sign-up">Sign up</Hyperlink>
        </p>
      </FormFooter>
    </>
  );
}
