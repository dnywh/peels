import * as React from "npm:react";
import { ReactNode } from "npm:react";
import { Text as ReactEmailText } from "npm:@react-email/components";
import { assignments } from "../../_shared/tokens.js";

export interface EmailCaptionProps {
  children: ReactNode;
}

const EmailCaption: React.FC<EmailCaptionProps> = ({ children }) => (
  <ReactEmailText style={caption}>{children}</ReactEmailText>
);

export default EmailCaption;

// Analagous to NewsletterImageFigcaption
const caption = {
  margin: "16px 0 0",
  fontSize: 13,
  lineHeight: "145%",
  textAlign: "center",
  color: assignments.colors.text.tertiary,
  textWrap: "balance",
};
