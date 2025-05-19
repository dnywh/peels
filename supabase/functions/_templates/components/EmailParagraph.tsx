import * as React from "npm:react";
import { ReactNode } from "npm:react";
import { Text as ReactEmailText } from "npm:@react-email/components";
import { assignments } from "../../_shared/tokens.js";

interface EmailParagraphProps {
  children: ReactNode;
}

const EmailParagraph = ({ children }: EmailParagraphProps) => (
  <ReactEmailText style={paragraph}>{children}</ReactEmailText>
);

export default EmailParagraph;

const paragraph = {
  fontSize: "16px",
  // lineHeight: "26px",
  lineHeight: "140%",
  // marginBottom: "24px",
  color: assignments.colors.text.ui.primary,

  em: {
    fontWeight: "500",
  },
};
