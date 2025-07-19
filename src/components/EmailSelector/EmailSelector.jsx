"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { siteConfig } from "@/config/site";
import EncodedEmailLink from "@/components/EncodedEmailLink";
import DecodedSpan from "@/components/DecodedSpan";
import Button from "@/components/Button";
import Form from "@/components/Form";
import Field from "@/components/Field";
import Label from "@/components/Label";
import Select from "@/components/Select";
import PostageStamp from "@/components/PostageStamp";
import { styled } from "@pigment-css/react";
import { useTranslations } from "next-intl";

export default function EmailSelector() {
  const searchParams = useSearchParams();
  const t = useTranslations("Contact");
  // Via search param possible values
  // therot
  const via = searchParams.get("via");

  // Address search param possible values
  const address = searchParams.get("address");

  // Map via parameters to their corresponding addresses
  const viaToAddressMap = {
    therot: "dw",
    // Add more mappings as needed:
    // podcast: "general",
    // conference: "dw",
  };

  // Determine the address: via mapping takes precedence, then address param, then default
  let finalAddress = "general";
  if (via && viaToAddressMap[via]) {
    finalAddress = viaToAddressMap[via];
  } else if (address) {
    finalAddress = address;
  }

  // Validate the final address against valid options
  const validAddresses = ["support", "dw", "general", "newsletter"];
  const validatedAddress = validAddresses.includes(finalAddress)
    ? finalAddress
    : "general";

  const [selectedEmailType, setSelectedEmailType] = useState(validatedAddress);
  const [isCopied, setIsCopied] = useState(false);

  // Reset isCopied when selectedEmailType changes
  useEffect(() => {
    setIsCopied(false);
  }, [selectedEmailType]);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      atob(siteConfig.encodedEmail[selectedEmailType])
    );
    setIsCopied(true);
  };

  return (
    <FormSection>
      <PostageStamp />
      <SubSectionTop>
        {via && <p>{via === "therot" ? t("via.therot") : t("via.general")}</p>}
        <Field>
          <Label htmlFor="contact">{t("contactLabel")}</Label>
          <Select
            id="contact"
            value={selectedEmailType}
            onChange={(event) => setSelectedEmailType(event.target.value)}
            required={true}
          >
            <option value="general">{t("contactOptions.general")}</option>
            <option value="support">{t("contactOptions.support")}</option>
            <option value="dw">{t("contactOptions.dw")}</option>
            <option value="newsletter">{t("contactOptions.newsletter")}</option>
          </Select>
        </Field>
      </SubSectionTop>
      <SubSectionBottom>
        <Field>
          <Label>{t("emailLabel")}</Label>
          <EncodedEmailLink
            address={siteConfig.encodedEmail[selectedEmailType]}
          >
            <DecodedSpan>
              {siteConfig.encodedEmail[selectedEmailType]}
            </DecodedSpan>
          </EncodedEmailLink>
        </Field>
        <Button onClick={handleCopy}>
          {isCopied ? t("copyButton.copied") : t("copyButton.copyAddress")}
        </Button>
      </SubSectionBottom>
    </FormSection>
  );
}

const FormSection = styled(Form)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "2.5rem",
  padding: "2rem",
  borderRadius: theme.corners.base,
  background: theme.colors.background.top,
  border: `1px solid ${theme.colors.border.base}`,
  // For PostageStamp
  overflow: "hidden",
  position: "relative",
}));

const SubSectionTop = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  // For PostageStamp
  "& > p": {
    marginRight: "8.5rem",
    textWrap: "balance",
  },
}));

const SubSectionBottom = styled("div")(({ theme }) => ({
  // borderTop: `1px solid ${theme.colors.border.base}`,
  // paddingTop: "2.5rem", // Match gap on parent
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "1rem",

  "& a": {
    fontWeight: "600",
    fontSize: "1.5rem",
  },

  "@media (min-width: 768px)": {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "1.5rem",

    "& a": {
      fontSize: "1.75rem",
    },
  },
}));
