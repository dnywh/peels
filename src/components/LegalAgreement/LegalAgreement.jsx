"use client";
import { siteConfig } from "@/config/site";
import CheckboxRow from "@/components/CheckboxRow";
import Hyperlink from "@/components/Hyperlink";

function LegalAgreement({ defaultChecked, required, disabled }) {
  return (
    <CheckboxRow
      defaultChecked={defaultChecked}
      disabled={disabled ? "disabled" : undefined}
      required={required}
    >
      I have read and agree to the Peels{" "}
      {/* Wrap links in spans as an alterntive to passive={true} on the label. This allows the rest of the label text to still act as a trigger on the checkbox. */}
      <span onClick={(e) => e.stopPropagation()}>
        <Hyperlink href={siteConfig.links.terms} target="_blank">
          terms of use
        </Hyperlink>
      </span>{" "}
      and{" "}
      <span onClick={(e) => e.stopPropagation()}>
        <Hyperlink href={siteConfig.links.privacy} target="_blank">
          privacy policy
        </Hyperlink>
      </span>
    </CheckboxRow>
  );
}

export default LegalAgreement;
