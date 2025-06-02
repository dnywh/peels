import * as React from "npm:react";
import { ReactNode } from "npm:react";
import { Link as ReactEmailLink } from "npm:@react-email/components";

export interface EmailLinkProps {
  href: string;
  children: ReactNode;
}
// A link component that inherits the style of the text it's a child of
const EmailLink: React.FC<EmailLinkProps> = ({ href, children }) => (
  <ReactEmailLink style={basicLink} href={href}>
    {children}
  </ReactEmailLink>
);
export default EmailLink;

const basicLink = {
  color: "inherit",
  textStyle: "inherit",
  textDecoration: "underline",
};
