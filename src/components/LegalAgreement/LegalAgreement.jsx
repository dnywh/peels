"use client";
import { siteConfig } from "@/config/site";
import CheckboxRow from "@/components/CheckboxRow";
import StrongLink from "@/components/StrongLink";
import { useTranslations } from "next-intl";

/**
 * @param {object} props
 * @param {boolean} [props.defaultChecked]
 * @param {boolean} props.required
 * @param {boolean} [props.disabled]
 */
function LegalAgreement({ defaultChecked, required, disabled = false }) {
  const t = useTranslations("Legal");

  return (
    <CheckboxRow
      defaultChecked={defaultChecked}
      disabled={disabled ? "disabled" : undefined}
      required={required}
    >
      {t.rich("agreement", {
        terms: (chunks) => (
          <span onClick={(e) => e.stopPropagation()}>
            <StrongLink href={siteConfig.links.terms} target="_blank">
              {chunks}
            </StrongLink>
          </span>
        ),
        privacy: (chunks) => (
          <span onClick={(e) => e.stopPropagation()}>
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
