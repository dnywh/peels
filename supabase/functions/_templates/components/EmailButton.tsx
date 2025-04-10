import * as React from "npm:react";
import { ReactNode } from "npm:react";
import { Button as ReactEmailButton } from "npm:@react-email/components";
import { assignments } from "../../_shared/tokens.js";

interface EmailButtonProps {
  href: string;
  children: ReactNode;
}

const EmailButton = ({ href, children }: EmailButtonProps) => (
  <ReactEmailButton style={button} href={href}>
    {children}
  </ReactEmailButton>
);
export default EmailButton;

const button = {
  margin: "24px 0",
  background: assignments.colors.button.primary.background,
  borderRadius: "10px",
  color: assignments.colors.button.primary.text,
  fontSize: "18px",
  fontWeight: "500",
  //   textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "16px",
};
