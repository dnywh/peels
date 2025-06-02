import * as React from "npm:react";
import { ReactNode } from "npm:react";
import { Heading as ReactEmailHeading } from "npm:@react-email/components";
import { assignments } from "../../_shared/tokens.js";

export interface EmailHeadingProps {
  as: string;
  children: ReactNode;
}

const EmailHeading: React.FC<EmailHeadingProps> = ({ as = "h2", children }) => {
  const getHeadingStyle = () => {
    const baseStyle = {
      margin: "32px 0 0",
      lineHeight: "110%",
      letterSpacing: "-0.015em",
      fontWeight: 500,
      color: assignments.colors.text.primary,
    };

    // Define font sizes for different heading levels
    const fontSizeMap = {
      h1: "36px",
      h2: "24px",
      h3: "20px",
      h4: "18px",
      h5: "16px",
      h6: "14px",
    };

    return {
      ...baseStyle,
      fontSize: fontSizeMap[as as keyof typeof fontSizeMap] || "24px", // Default to h2 size if invalid heading level
    };
  };

  return (
    <ReactEmailHeading as={as} style={getHeadingStyle()}>
      {children}
    </ReactEmailHeading>
  );
};

export default EmailHeading;
