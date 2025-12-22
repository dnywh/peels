import * as React from "npm:react";
import { ReactNode } from "npm:react";
import { assignments } from "../../_shared/tokens.js";

export interface EmailUnorderedListProps {
  children: ReactNode;
}

const EmailUnorderedList: React.FC<EmailUnorderedListProps> = ({
  children,
}) => <ul style={listStyle}>{children}</ul>;

export default EmailUnorderedList;

const listStyle = {
  fontSize: 16,
  lineHeight: "145%",
  letterSpacing: "-0.01em",
  color: assignments.colors.text.ui.secondary,
  margin: "16px 0",
  paddingLeft: "24px",
};
