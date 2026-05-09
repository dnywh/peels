import { getTranslations } from "next-intl/server";
import FaqContainer from "@/components/FaqContainer";
import FaqDetails from "@/components/FaqDetails";
import StrongLink from "@/components/StrongLink";

async function SupportFaq() {
  const supportT = await getTranslations("Support.supportFaq");
  const peelsT = await getTranslations("Support.peelsFaq");

  return (
    <FaqContainer>
      <FaqDetails>
        <summary>{peelsT("findDropOff.question")}</summary>
        {peelsT.rich("findDropOff.answer", {
          p: (chunks) => <p>{chunks}</p>,
          map: (chunks) => <StrongLink href="/map">{chunks}</StrongLink>,
        })}
      </FaqDetails>
      <FaqDetails>
        <summary>{peelsT("noGarden.question")}</summary>
        <p>{peelsT("noGarden.answer")}</p>
      </FaqDetails>
      <FaqDetails>
        <summary>{peelsT("mapPrivacy.question")}</summary>
        {peelsT.rich("mapPrivacy.answer", {
          p: (chunks) => <p>{chunks}</p>,
        })}
      </FaqDetails>
      <FaqDetails>
        <summary>{supportT("manageEmails.question")}</summary>
        {supportT.rich("manageEmails.answer", {
          p: (chunks) => <p>{chunks}</p>,
        })}
      </FaqDetails>
    </FaqContainer>
  );
}

export default SupportFaq;
