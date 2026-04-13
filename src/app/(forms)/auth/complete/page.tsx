import Form from "@/components/Form";
import FormHeader from "@/components/FormHeader";
import { getTranslations } from "next-intl/server";

export default async function AuthCompletePage() {
  const t = await getTranslations("Auth.complete");

  return (
    <>
      <FormHeader button="none">
        <h1>{t("title")}</h1>
      </FormHeader>
      <Form as="container">
        <p>{t("body")}</p>
      </Form>
    </>
  );
}
