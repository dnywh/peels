import * as React from "npm:react";
import { ReactNode } from "npm:react";

export interface EmailTextEmphasizedProps {
  children: ReactNode;
}

const EmailTextEmphasized: React.FC<EmailTextEmphasizedProps> = ({
  children,
}) => <em style={emphasized}>{children}</em>;

export default EmailTextEmphasized;

const emphasized = {
  fontStyle: "inherit", // Don't italicize unless the parent element already does
  fontSize: "inherit",
  fontWeight: 500,
};
