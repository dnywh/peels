"use client";

import { siteConfig } from "@/config/site";
import CheckboxRow from "@/components/CheckboxRow";
import StrongLink from "@/components/StrongLink";
import { useTranslations } from "next-intl";

type LegalAgreementProps = {
  defaultChecked?: boolean;
  required: boolean;
  disabled?: boolean;
};

function LegalAgreement({
  defaultChecked,
  required,
  disabled = false,
}: LegalAgreementProps) {
  const t = useTranslations("Legal");

  return (
    <CheckboxRow
      name="legal_agreement"
      defaultChecked={defaultChecked}
      disabled={disabled}
      required={required}
    >
      {t.rich("agreement", {
        terms: (chunks) => (
          <span onClick={(event) => event.stopPropagation()}>
            <StrongLink href={siteConfig.links.terms} target="_blank">
              {chunks}
            </StrongLink>
          </span>
        ),
        privacy: (chunks) => (
          <span onClick={(event) => event.stopPropagation()}>
            <StrongLink href={siteConfig.links.privacy} target="_blank">
              {chunks}
            </StrongLink>
          </span>
        ),
      })}
    </CheckboxRow>
  );
}

export default LegalAgreement;
