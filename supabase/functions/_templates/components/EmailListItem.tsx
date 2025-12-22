import * as React from "npm:react";
import { ReactNode } from "npm:react";

export interface EmailListItemProps {
  children: ReactNode;
}

const EmailListItem: React.FC<EmailListItemProps> = ({ children }) => (
  <li style={listItemStyle}>{children}</li>
);

export default EmailListItem;

const listItemStyle = {
  marginBottom: "8px",
};

