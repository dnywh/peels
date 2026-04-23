import { getTranslations } from "next-intl/server";
import FaqContainer from "@/components/FaqContainer";
import FaqDetails from "@/components/FaqDetails";

async function SupportFaq() {
  const t = await getTranslations("Support.supportFaq");

  return (
    <FaqContainer>
      <FaqDetails>
        <summary>{t("manageEmails.question")}</summary>
        {t.rich("manageEmails.answer", {
          p: (chunks) => <p>{chunks}</p>,
        })}
      </FaqDetails>
    </FaqContainer>
  );
}

export default SupportFaq;
