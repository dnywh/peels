import * as React from "npm:react";
import { ReactNode } from "npm:react";
import { Link as ReactEmailLink } from "npm:@react-email/components";

interface EmailFooterLinkProps {
  href: string;
  children: ReactNode;
}

const EmailFooterLink = ({ href, children }: EmailFooterLinkProps) => (
  <ReactEmailLink style={footerLink} href={href}>
    {children}
  </ReactEmailLink>
);
export default EmailFooterLink;

const footerLink = {
  color: "inherit",
  textDecoration: "underline",
};
