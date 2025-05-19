import * as React from "npm:react";
import { ReactNode } from "npm:react";

interface EmailTextEmphasizedProps {
  children: ReactNode;
}

const EmailTextEmphasized = ({ children }: EmailTextEmphasizedProps) => (
  <em style={emphasized}>{children}</em>
);

export default EmailTextEmphasized;

const emphasized = {
  fontStyle: "inherit", // Don't italicize unless the parent element already does
  fontSize: "inherit",
  fontWeight: "500",
};
