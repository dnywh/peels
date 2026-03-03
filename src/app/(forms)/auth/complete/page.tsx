import Form from "@/components/Form";
import FormHeader from "@/components/FormHeader";

export default function AuthCompletePage() {
  return (
    <>
      <FormHeader button="none">
        <h1>Signing you in...</h1>
      </FormHeader>
      <Form as="container">
        <p>
          We’re securely confirming your link. You’ll be redirected in a
          moment.
        </p>
      </Form>
    </>
  );
}
