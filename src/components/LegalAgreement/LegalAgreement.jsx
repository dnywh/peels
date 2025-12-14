"use client";
import { siteConfig } from "@/config/site";
import CheckboxRow from "@/components/CheckboxRow";
import StrongLink from "@/components/StrongLink";

/**
 * @param {object} props
 * @param {boolean} [props.defaultChecked]
 * @param {boolean} props.required
 * @param {boolean} [props.disabled]
 */
function LegalAgreement({ defaultChecked, required, disabled = false }) {
  return (
    <CheckboxRow
      defaultChecked={defaultChecked}
      disabled={disabled ? "disabled" : undefined}
      required={required}
    >
      I have read and agree to the Peels{" "}
      {/* Wrap links in spans as an alterntive to passive={true} on the label. This allows the rest of the label text to still act as a trigger on the checkbox. */}
      <span onClick={(e) => e.stopPropagation()}>
        <StrongLink href={siteConfig.links.terms} target="_blank">
          terms of use
        </StrongLink>
      </span>{" "}
      and{" "}
      <span onClick={(e) => e.stopPropagation()}>
        <StrongLink href={siteConfig.links.privacy} target="_blank">
          privacy policy
        </StrongLink>
      </span>
    </CheckboxRow>
  );
}

export default LegalAgreement;
