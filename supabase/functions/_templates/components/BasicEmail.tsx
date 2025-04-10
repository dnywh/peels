import * as React from "npm:react";
import { ReactNode } from "npm:react";
import {
  Html,
  Head,
  Heading,
  Font,
  Preview,
  Body,
  Container,
  Img,
  Text,
  Section,
} from "npm:@react-email/components";
import { assignments } from "../../_shared/tokens.js";

interface BasicEmailProps {
  logoUnread: boolean;
  previewText: string;
  headingText: string;
  footerText: ReactNode;
  children: ReactNode;
}

const assetUrl = Deno.env.get("STATIC_ASSET_URL");

export const BasicEmail = ({
  logoUnread,
  previewText,
  headingText,
  footerText,
  children,
}: BasicEmailProps) => {
  return (
    <Html style={html} lang="en">
      <Head>
        <Font
          fontFamily="National 2"
          fallbackFontFamily={["Helvetica", "sans-serif"]}
          webFont={{
            url: `${assetUrl}/national-2-regular.woff2`,
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="National 2"
          fallbackFontFamily={["Helvetica", "sans-serif"]}
          webFont={{
            url: `${assetUrl}/national-2-medium.woff2`,
            format: "woff2",
          }}
          fontWeight={500}
          fontStyle="normal"
        />
        <Font
          fontFamily="National 2"
          fallbackFontFamily={["Helvetica", "sans-serif"]}
          webFont={{
            url: `${assetUrl}/national-2-bold.woff2`,
            format: "woff2",
          }}
          fontWeight={700}
          fontStyle="normal"
        />
      </Head>
      <Preview>{previewText}</Preview>

      <Body style={body}>
        <Container style={container}>
          <Section style={introSection}>
            <Img
              src={`${assetUrl}/logo${logoUnread ? "-unread" : ""}.png`}
              width="42"
              height="44"
              alt="Peels logo"
              style={logoImg}
            />
            <Heading as="h1" style={heading}>
              {headingText}
            </Heading>
          </Section>

          <Section style={mainContentSection}>{children}</Section>

          <Section style={footerSection}>
            <Text style={footer}>{footerText}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default BasicEmail;

const html = {
  // backgroundColor: assignments.colors.background.sunk, // For full-bleed on Apple Mail, iOS
};

const body = {
  backgroundColor: assignments.colors.background.sunk, // For Gmail
  padding: "40px 12px 24px", // Was margin
  borderRadius: "8px",
};

const container = {
  maxWidth: "472px",
};

const introSection = {
  padding: "0 24px", // Inset a little bit
  color: assignments.colors.text.brand.primary,
};

const logoImg = {
  margin: "0 auto",
};

const heading = {
  fontSize: "36px",
  lineHeight: "110%",
  letterSpacing: "-0.015em",
  // fontWeight: "bold",
  // marginBottom: "24px",
  margin: "16px auto 28px",
  textAlign: "center" as const,
  textWrap: "balance" as const,
};

const mainContentSection = {
  boxShadow: `0 0 0 2px rgba(0, 0, 0, 0.03)`,
  backgroundColor: assignments.colors.background.top,
  // margin: "0 auto",
  padding: "12px 16px",
  // maxWidth: "580px",
  borderRadius: "16px",
};

const paragraph = {
  fontSize: "16px",
  // lineHeight: "26px",
  lineHeight: "150%",
  // marginBottom: "24px",
  color: assignments.colors.text.ui.primary,
};

const footerSection = {
  padding: "0 24px", // Inset a little bit
  textAlign: "center" as const,
  textWrap: "balance" as const,
};

const footer = {
  color: assignments.colors.text.ui.quaternary,
  fontSize: "14px",
  lineHeight: "150%",
};

const footerLink = {
  color: "inherit",
  textDecoration: "underline",
};
