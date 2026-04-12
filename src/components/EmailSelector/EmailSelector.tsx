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

type EmailType = "support" | "dw" | "general" | "newsletter";
type CopyStatus = "idle" | "copying" | "copied" | "error";

export default function EmailSelector() {
  const searchParams = useSearchParams();
  const t = useTranslations("Contact");
  // Via search param possible values
  // therot
  const via = searchParams.get("via");

  // Address search param possible values
  const address = searchParams.get("address");

  // Map via parameters to their corresponding addresses
  const viaToAddressMap: Partial<Record<string, EmailType>> = {
    therot: "dw",
    // Add more mappings as needed:
    // podcast: "general",
    // conference: "dw",
  };

  // Determine the address: via mapping takes precedence, then address param, then default
  let finalAddress: string = "general";
  if (via && viaToAddressMap[via]) {
    finalAddress = viaToAddressMap[via];
  } else if (address) {
    finalAddress = address;
  }

  // Validate the final address against valid options
  const validAddresses: EmailType[] = [
    "support",
    "dw",
    "general",
    "newsletter",
  ];
  const validatedAddress = validAddresses.includes(finalAddress as EmailType)
    ? (finalAddress as EmailType)
    : "general";

  const [selectedEmailType, setSelectedEmailType] = useState(validatedAddress);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");

  // Reset isCopied when selectedEmailType changes
  useEffect(() => {
    setCopyStatus("idle");
  }, [selectedEmailType]);

  const handleCopy = async () => {
    if (copyStatus === "copying") return;

    setCopyStatus("copying");
    try {
      await Promise.all([
        navigator.clipboard.writeText(
          atob(siteConfig.encodedEmail[selectedEmailType])
        ),
        new Promise((resolve) => setTimeout(resolve, 150)),
      ]);
      setCopyStatus("copied");
    } catch (error) {
      console.error("Error copying email address:", error);
      setCopyStatus("error");
    }
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
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedEmailType(event.target.value as EmailType)
            }
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
        <Button
          onClick={handleCopy}
          loading={copyStatus === "copying"}
          loadingText={t("copyButton.copying")}
        >
          {copyStatus === "copied"
            ? t("copyButton.copied")
            : copyStatus === "error"
              ? t("copyButton.copyFailed")
              : t("copyButton.copyAddress")}
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
