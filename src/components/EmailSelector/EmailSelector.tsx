"use client";
import { theme } from "@/styles/theme.yak";
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
import { styled } from "next-yak";
import { useTranslations } from "next-intl";

type EmailType = "support" | "dw" | "general" | "newsletter";
type CopyStatus = "idle" | "copying" | "copied" | "error";

export default function EmailSelector() {
  const searchParams = useSearchParams();
  const t = useTranslations("Contact");
  const address = searchParams.get("address");

  const requestedAddress = address ?? "general";

  // Validate the final address against valid options
  const validAddresses: EmailType[] = [
    "support",
    "dw",
    "general",
    "newsletter",
  ];
  const validatedAddress = validAddresses.includes(
    requestedAddress as EmailType
  )
    ? (requestedAddress as EmailType)
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
        <Field>
          <Label htmlFor="contact-address">{t("contactLabel")}</Label>
          <Select
            id="contact-address"
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
        <EmailLabelText>{t("emailLabel")}</EmailLabelText>
        <EmailActionRow>
          <EncodedEmailLink
            address={siteConfig.encodedEmail[selectedEmailType]}
          >
            <DecodedSpan>
              {siteConfig.encodedEmail[selectedEmailType]}
            </DecodedSpan>
          </EncodedEmailLink>
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
        </EmailActionRow>
      </SubSectionBottom>
    </FormSection>
  );
}

const FormSection = styled(Form)`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 2rem;
  border-radius: ${theme.corners.base};
  background: ${theme.colors.background.top};
  border: 1px solid ${theme.colors.border.base};
  overflow: hidden;
  position: relative;
`;

const SubSectionTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  & > p {
    margin-right: 8.5rem;
    text-wrap: balance;
  }
`;

const SubSectionBottom = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.spacing.forms.gap.field};

  & a {
    font-weight: 600;
    font-size: 1.5rem;
  }

  @media (min-width: 768px) {
    width: 100%;

    & a {
      font-size: 1.75rem;
    }
  }
`;

const EmailLabelText = styled.p`
  color: ${theme.colors.text.ui.primary};
  font-weight: 500;
`;

const EmailActionRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  width: 100%;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }
`;
