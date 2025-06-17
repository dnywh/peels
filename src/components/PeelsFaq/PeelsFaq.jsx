import { useTranslations } from "next-intl";
import { siteConfig } from "@/config/site";
import FaqContainer from "@/components/FaqContainer";
import FaqDetails from "@/components/FaqDetails";
import StrongLink from "@/components/StrongLink";
import EncodedEmailLink from "@/components/EncodedEmailLink";

// General FAQ for 'about Peels'
function PeelsFaq() {
  const t = useTranslations("Support.peelsFaq");
  return (
    <FaqContainer>
      <FaqDetails>
        <summary>{t("whosBehind.question")}</summary>
        {t.rich("whosBehind.answer", {
          p: (chunks) => <p>{chunks}</p>,
          danny: (chunks) => (
            <StrongLink href="https://dannywhite.net" target="_blank">
              {chunks}
            </StrongLink>
          ),
          opensource: (chunks) => (
            <StrongLink
              href={`${siteConfig.repoUrl}?tab=readme-ov-file#forking-peels`}
              target="_blank"
            >
              {chunks}
            </StrongLink>
          ),
        })}
      </FaqDetails>
      <FaqDetails>
        <summary>{t("howDifferent.question")}</summary>
        {t.rich("howDifferent.answer", {
          p: (chunks) => <p>{chunks}</p>,
        })}
      </FaqDetails>
      <FaqDetails>
        <summary>{t("financialModel.question")}</summary>
        <p>{t("financialModel.answer")}</p>
      </FaqDetails>
      <FaqDetails>
        <summary>{t("fogo.question")}</summary>
        <p>{t("fogo.answer")}</p>
      </FaqDetails>
      <FaqDetails>
        <summary>{t("mapPrivacy.question")}</summary>
        {t.rich("mapPrivacy.answer", {
          p: (chunks) => <p>{chunks}</p>,
        })}
      </FaqDetails>
      <FaqDetails>
        <summary>{t("getInvolved.question")}</summary>
        {t.rich("getInvolved.answer", {
          p: (chunks) => <p>{chunks}</p>,
          repo: (chunks) => (
            <StrongLink
              href={`${siteConfig.repoUrl}?tab=readme-ov-file#forking-peels`}
              target="_blank"
            >
              {chunks}
            </StrongLink>
          ),
          email: (chunks) => (
            <EncodedEmailLink address={siteConfig.email.support}>
              {chunks}
            </EncodedEmailLink>
          ),
        })}
      </FaqDetails>
      <FaqDetails>
        <summary>{t("promotion.question")}</summary>
        {t.rich("promotion.answer", {
          p: (chunks) => <p>{chunks}</p>,
          promoKit: (chunks) => (
            <StrongLink
              href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/static/promo-kit.zip`}
            >
              {chunks}
            </StrongLink>
          ),
          email: (chunks) => (
            <EncodedEmailLink address={siteConfig.email.support}>
              {chunks}
            </EncodedEmailLink>
          ),
        })}
      </FaqDetails>
      <FaqDetails>
        <summary>{t("government.question")}</summary>
        {t.rich("government.answer", {
          p: (chunks) => <p>{chunks}</p>,
          email: (chunks) => (
            <EncodedEmailLink address={siteConfig.email.support}>
              {chunks}
            </EncodedEmailLink>
          ),
        })}
      </FaqDetails>
    </FaqContainer>
  );
}

export default PeelsFaq;
