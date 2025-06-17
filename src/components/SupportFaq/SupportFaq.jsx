import { useTranslations } from "next-intl";
import FaqContainer from "@/components/FaqContainer";
import FaqDetails from "@/components/FaqDetails";

// FAQ for using Peels
function SupportFaq() {
  const t = useTranslations("Support.supportFaq");
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
