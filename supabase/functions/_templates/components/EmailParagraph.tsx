import * as React from "npm:react";
import { ReactNode } from "npm:react";
import { Text as ReactEmailText } from "npm:@react-email/components";
import { assignments } from "../../_shared/tokens.js";

export interface EmailParagraphProps {
  children: ReactNode;
}

const EmailParagraph: React.FC<EmailParagraphProps> = ({ children }) => (
  <ReactEmailText style={paragraph}>{children}</ReactEmailText>
);

export default EmailParagraph;

const paragraph = {
  fontSize: 16,
  lineHeight: "145%",
  letterSpacing: "-0.01em",
  color: assignments.colors.text.ui.secondary,
};
