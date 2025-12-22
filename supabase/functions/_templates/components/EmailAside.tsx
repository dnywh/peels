import * as React from "npm:react";
import { ReactNode } from "npm:react";
import { Section, Text } from "npm:@react-email/components";
import EmailParagraph from "./EmailParagraph.tsx";
import { assignments } from "../../_shared/tokens.js";

export interface EmailAsideProps {
  title: string;
  children: ReactNode;
}

// Sibling to NewsletterAside, used in newsletter issues
const EmailAside: React.FC<EmailAsideProps> = ({ title, children }) => (
  <Section style={asideSection}>
    <Text style={asideHeader}>{title}</Text>
    <EmailParagraph>{children}</EmailParagraph>
  </Section>
);
export default EmailAside;

const asideSection = {
  background: assignments.colors.background.sunk,
  borderRadius: 9,
  padding: "16px 16px 8px",
  margin: "24px 0 0",
};

const asideHeader = {
  margin: 0,
  fontSize: 13,
  color: assignments.colors.text.ui.quinary,
  textTransform: "uppercase",
  fontWeight: 500,
  letterSpacing: "0.0875em",
};
