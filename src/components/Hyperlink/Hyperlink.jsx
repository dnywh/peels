import Link from "next/link";
import { styled } from "@pigment-css/react";

const getSharedStyles = ({ theme }) => ({
  color: theme.colors.text.primary,
  fontWeight: "500",
  textDecoration: "underline",
  transition: "opacity 150ms ease-in-out",
  "&:hover": {
    opacity: 0.65,
  },
});

const StyledLink = styled(Link)(getSharedStyles);
const StyledAnchor = styled("a")(getSharedStyles);

// An pre-styled anchor element (or button that looks like one)
export default function Hyperlink({ as = Link, children, href, ...props }) {
  if (as === "anchor") {
    return (
      <StyledAnchor href={href} {...props}>
        {children}
      </StyledAnchor>
    );
  }

  return (
    <StyledLink href={href} {...props}>
      {children}
    </StyledLink>
  );
}
