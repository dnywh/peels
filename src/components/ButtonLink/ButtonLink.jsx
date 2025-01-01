import Link from "next/link";
import { styled } from "@pigment-css/react";

const StyledButtonLink = styled(Link)({
  // Extend existing button styles
  display: "inline-block",
  padding: "0.5rem 1rem",
  background: "blue",
  color: "white",
  borderRadius: "0.25rem",
  /// And then set <a> specific styles
  textDecoration: "none",
});

function ButtonLink({ href, children }) {
  return <StyledButtonLink href={href}>{children}</StyledButtonLink>;
}

export default ButtonLink;
