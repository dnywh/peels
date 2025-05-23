import FormHeader from "@/components/FormHeader";
import Form from "@/components/Form";
import FormFooter from "@/components/FormFooter";
import Hyperlink from "@/components/Hyperlink";
import EncodedEmailHyperlink from "@/components/EncodedEmailHyperlink";
import SignUpForm from "@/components/SignUpForm";

export const metadata = {
  title: "Sign Up",
};

export default async function SignUp(props: {
  searchParams: Promise<{
    error?: string;
    success?: boolean;
    email?: string;
    first_name?: string;
    from?: string;
  }>;
}) {
  // TODO: How are these searchParams working without special Next.js magic?
  // I could simplify my server -> client set up elsewhere if I just use this more seemingly 'native' way
  const searchParams = await props.searchParams;

  // Handle success state
  if (searchParams.success) {
    return (
      <>
        <FormHeader button="none">
          <h1>Check your email</h1>
        </FormHeader>
        <Form as="container">
          <>
            <p>
              Thanks for signing up
              {searchParams.first_name && `, ${searchParams.first_name}`}!
              Please check your inbox and spam for a verification link. This
              link will expire in an hour from now.
            </p>
          </>
        </Form>
        <FormFooter>
          <p>
            Never received the email? Check your spam folder.{" "}
            {/* TODO: Resend verification email to {searchParams.email}. */}
            <EncodedEmailHyperlink address="c3VwcG9ydEBwZWVscy5hcHA=">
              Reach out
            </EncodedEmailHyperlink>{" "}
            if you still need help.
          </p>
        </FormFooter>
      </>
    );
  }

  return (
    <>
      {/* TODO: Make FormHeader action conditional based on whether this page (which should be a component) is rendered modally or as a page */}
      <FormHeader button="back">
        <h1>
          Sign up to{" "}
          {searchParams.from === "listing"
            ? "contact hosts"
            : "start composting"}
        </h1>
      </FormHeader>

      <SignUpForm
        defaultValues={{
          first_name: searchParams.first_name,
          email: searchParams.email,
        }}
        error={searchParams.error}
      />

      <FormFooter>
        <p>
          Already have an account?{" "}
          <Hyperlink href="/sign-in">Sign in</Hyperlink>
        </p>
      </FormFooter>
    </>
  );
}
