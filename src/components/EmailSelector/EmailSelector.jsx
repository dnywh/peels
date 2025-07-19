"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { siteConfig } from "@/config/site";
import EncodedEmailLink from "@/components/EncodedEmailLink";
import DecodedSpan from "@/components/DecodedSpan";
import Button from "@/components/Button";
import HeaderBlock from "@/components/HeaderBlock";
import Form from "@/components/Form";
import Field from "@/components/Field";
import Label from "@/components/Label";
import Input from "@/components/Input";
import Select from "@/components/Select";
import InputHint from "@/components/InputHint";
import PostageStamp from "@/components/PostageStamp";
import { styled } from "@pigment-css/react";

function EmailSelector() {
  const searchParams = useSearchParams();
  const [isContact, setIsContact] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(atob(siteConfig.encodedEmail.dw));
    setIsCopied(true);
  };
  // Via search param possible values
  // therot
  const via = searchParams.get("via");

  // Address search param possible values
  // support
  // dw
  // general
  // newsletter
  const address = searchParams.get("address");

  return (
    <FormSection>
      <PostageStamp />
      <SubSectionTop>
        {via && (
          <p>
            {via === "therot"
              ? "Hello reader of The Rot! Thanks for stopping by. Here’s a direct line for Danny."
              : "Hello there! Here are some email addresses you can contact us on."}
          </p>
        )}
        <Field>
          <Label htmlFor="contact">If you want to</Label>
          <Select
            id="contact"
            value={isContact}
            onChange={(event) => setIsContact(event.target.value === "true")}
            required={true}
          >
            <option value="general">Make a general enquiry</option>
            <option value="support">Get help with something</option>
            <option value="dw">Talk to Danny</option>
          </Select>
        </Field>
      </SubSectionTop>
      <SubSectionBottom>
        <Field>
          <Label>You’re best off emailing</Label>
          <EncodedEmailLink address={siteConfig.encodedEmail.dw}>
            <DecodedSpan>{siteConfig.encodedEmail.dw}</DecodedSpan>
          </EncodedEmailLink>
        </Field>
        <Button onClick={handleCopy}>
          {isCopied ? "Copied!" : "Copy address"}
        </Button>
      </SubSectionBottom>
    </FormSection>
  );
}

export default EmailSelector;

const FormSection = styled(Form)(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  backgroundColor: theme.colors.background.top,
  border: `1px solid ${theme.colors.border.base}`,
  borderRadius: theme.corners.base,
  padding: `calc(${theme.spacing.unit} * 3) calc(${theme.spacing.unit} * 1.5) calc(${theme.spacing.unit} * 1.5)`, // + 1.5 units internally, for consistency with other sections that may or may not have hover padding internally
  // For PostageStamp
  overflow: "hidden",
  position: "relative",
}));

const SubSectionTop = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  maxWidth: "300px",
}));

const SubSectionBottom = styled("div")(({ theme }) => ({
  borderTop: `1px solid ${theme.colors.border.base}`,
  paddingTop: "1.5rem",
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "1.5rem",

  "& a": {
    fontSize: "2rem",
    fontWeight: "600",
  },
}));
